import { defineStore } from 'pinia'

interface AppState {
  isOfflineReady: boolean
  lastSyncedAt: string | null
  pageTitle: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    isOfflineReady: false,
    lastSyncedAt: null,
    pageTitle: 'Inventorie',
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
  },
})
