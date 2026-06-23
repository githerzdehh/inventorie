import { defineStore } from 'pinia'

interface AppState {
  isOfflineReady: boolean
  lastSyncedAt: string | null
  pageTitle: string
  language: string
  currency: string
  dataSharingConsent: boolean
  comparisonStopped: boolean
  selectedPlanId: string
  supportSubmissions: SupportSubmission[]
  hasInitializedPreferences: boolean
}

const appPreferenceStorageKey = 'inventorie:app-preferences'
const defaultLanguage = 'en-US'
const defaultCurrency = 'PHP'
const defaultPlanId = 'basic-free'

interface StoredAppPreferences {
  language?: string
  currency?: string
  dataSharingConsent?: boolean
  comparisonStopped?: boolean
  selectedPlanId?: string
  supportSubmissions?: SupportSubmission[]
}

export interface SupportSubmission {
  id: string
  topic: string
  email: string
  phoneNumber: string
  message: string
  createdAt: string
}

function readStoredPreferences(): StoredAppPreferences {
  if (typeof window === 'undefined') {
    return {}
  }

  const storedPreferences = window.localStorage.getItem(appPreferenceStorageKey)

  if (!storedPreferences) {
    return {}
  }

  try {
    return JSON.parse(storedPreferences) as StoredAppPreferences
  } catch {
    return {}
  }
}

function writeStoredPreferences(preferences: StoredAppPreferences) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(appPreferenceStorageKey, JSON.stringify(preferences))
}

function isSupportSubmission(value: unknown): value is SupportSubmission {
  if (!value || typeof value !== 'object') {
    return false
  }

  const submission = value as Partial<SupportSubmission>

  return (
    typeof submission.id === 'string' &&
    typeof submission.topic === 'string' &&
    typeof submission.email === 'string' &&
    typeof submission.phoneNumber === 'string' &&
    typeof submission.message === 'string' &&
    typeof submission.createdAt === 'string'
  )
}

function makeSupportSubmissionId(): string {
  if (globalThis.crypto?.randomUUID) {
    return `support-${globalThis.crypto.randomUUID()}`
  }

  return `support-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isOfflineReady: false,
    lastSyncedAt: null,
    pageTitle: 'Inventorie',
    language: defaultLanguage,
    currency: defaultCurrency,
    dataSharingConsent: false,
    comparisonStopped: false,
    selectedPlanId: defaultPlanId,
    supportSubmissions: [],
    hasInitializedPreferences: false,
  }),
  actions: {
    setOfflineReady(value: boolean) {
      this.isOfflineReady = value
    },
    setLastSyncedAt(value: string | null) {
      this.lastSyncedAt = value
    },
    setPageTitle(value: string) {
      this.pageTitle = value
    },
    initializePreferences() {
      if (this.hasInitializedPreferences) {
        return
      }

      const preferences = readStoredPreferences()
      this.language = preferences.language ?? defaultLanguage
      this.currency = preferences.currency ?? defaultCurrency
      this.dataSharingConsent = Boolean(preferences.dataSharingConsent)
      this.comparisonStopped = Boolean(preferences.comparisonStopped)
      this.selectedPlanId = preferences.selectedPlanId ?? defaultPlanId
      this.supportSubmissions = Array.isArray(preferences.supportSubmissions)
        ? preferences.supportSubmissions.filter(isSupportSubmission)
        : []
      this.hasInitializedPreferences = true
    },
    persistPreferences() {
      writeStoredPreferences({
        language: this.language,
        currency: this.currency,
        dataSharingConsent: this.dataSharingConsent,
        comparisonStopped: this.comparisonStopped,
        selectedPlanId: this.selectedPlanId,
        supportSubmissions: this.supportSubmissions,
      })
    },
    setLanguage(value: string) {
      this.initializePreferences()
      this.language = value
      this.persistPreferences()
    },
    setCurrency(value: string) {
      this.initializePreferences()
      this.currency = value
      this.persistPreferences()
    },
    setDataSharingConsent(value: boolean) {
      this.initializePreferences()
      this.dataSharingConsent = value
      this.persistPreferences()
    },
    setComparisonStopped(value: boolean) {
      this.initializePreferences()
      this.comparisonStopped = value
      this.persistPreferences()
    },
    setSelectedPlan(planId: string) {
      this.initializePreferences()
      this.selectedPlanId = planId
      this.persistPreferences()
    },
    addSupportSubmission(input: Omit<SupportSubmission, 'id' | 'createdAt'>): SupportSubmission {
      this.initializePreferences()

      const submission = {
        ...input,
        id: makeSupportSubmissionId(),
        createdAt: new Date().toISOString(),
      }
      this.supportSubmissions = [submission, ...this.supportSubmissions].slice(0, 12)
      this.persistPreferences()

      return submission
    },
    resetPreferences() {
      this.language = defaultLanguage
      this.currency = defaultCurrency
      this.dataSharingConsent = false
      this.comparisonStopped = false
      this.selectedPlanId = defaultPlanId
      this.supportSubmissions = []
      this.hasInitializedPreferences = true

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(appPreferenceStorageKey)
      }
    },
  },
})
