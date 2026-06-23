import { defineStore } from 'pinia'

interface AppState {
  isOfflineReady: boolean
  lastSyncedAt: string | null
  pageTitle: string
  language: string
  currency: string
  hasInitializedPreferences: boolean
}

const appPreferenceStorageKey = 'inventorie:app-preferences'
const defaultLanguage = 'en-US'
const defaultCurrency = 'USD'

interface StoredAppPreferences {
  language?: string
  currency?: string
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

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isOfflineReady: false,
    lastSyncedAt: null,
    pageTitle: 'Inventorie',
    language: defaultLanguage,
    currency: defaultCurrency,
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
      this.hasInitializedPreferences = true
    },
    setLanguage(value: string) {
      this.initializePreferences()
      this.language = value
      writeStoredPreferences({ language: this.language, currency: this.currency })
    },
    setCurrency(value: string) {
      this.initializePreferences()
      this.currency = value
      writeStoredPreferences({ language: this.language, currency: this.currency })
    },
  },
})
