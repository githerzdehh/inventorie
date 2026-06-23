import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/stores/app'

describe('app store mock preferences', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('persists language, currency, consent, comparison, plan, and support submissions', () => {
    const appStore = useAppStore()

    appStore.initializePreferences()
    expect(appStore.language).toBe('en-US')
    expect(appStore.currency).toBe('PHP')

    appStore.setLanguage('tl-PH')
    appStore.setCurrency('USD')
    appStore.setDataSharingConsent(true)
    appStore.setComparisonStopped(true)
    appStore.setSelectedPlan('unbasic-monthly')
    appStore.addSupportSubmission({
      topic: 'bug',
      email: 'diane@inventorie.local',
      phoneNumber: '+639171110001',
      message: 'The scanner button needs attention.',
    })

    setActivePinia(createPinia())
    const restoredStore = useAppStore()
    restoredStore.initializePreferences()

    expect(restoredStore.language).toBe('tl-PH')
    expect(restoredStore.currency).toBe('USD')
    expect(restoredStore.dataSharingConsent).toBe(true)
    expect(restoredStore.comparisonStopped).toBe(true)
    expect(restoredStore.selectedPlanId).toBe('unbasic-monthly')
    expect(restoredStore.supportSubmissions).toHaveLength(1)
  })

  it('resets browser-local mock preferences', () => {
    const appStore = useAppStore()

    appStore.setLanguage('ja-JP')
    appStore.setCurrency('JPY')
    appStore.setDataSharingConsent(true)
    appStore.resetPreferences()

    expect(appStore.language).toBe('en-US')
    expect(appStore.currency).toBe('PHP')
    expect(appStore.dataSharingConsent).toBe(false)
    expect(window.localStorage.getItem('inventorie:app-preferences')).toBeNull()
  })
})
