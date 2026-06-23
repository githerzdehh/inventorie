import { defineStore } from 'pinia'

export type NotificationType = 'friend-gift' | 'pantry' | 'recipe' | 'system'

export interface AppNotification {
  id: string
  title: string
  description: string
  createdAt: string
  type: NotificationType
  read: boolean
}

interface NotificationsState {
  notifications: AppNotification[]
}

const notificationStorageKey = 'inventorie:notifications'

const defaultNotifications: AppNotification[] = [
  {
    id: 'welcome-basket',
    title: 'Welcome basket from Maya',
    description: 'A starter bundle with pantry staples is ready to review.',
    createdAt: '2026-06-21T16:30:00.000Z',
    type: 'friend-gift',
    read: false,
  },
  {
    id: 'weekend-snacks',
    title: 'Weekend snacks from Jordan',
    description: 'Shared treats and ingredients for your next gathering.',
    createdAt: '2026-06-20T12:15:00.000Z',
    type: 'friend-gift',
    read: false,
  },
  {
    id: 'pantry-checkup',
    title: 'Pantry checkup',
    description: 'Review items that may need attention before your next grocery run.',
    createdAt: '2026-06-18T09:00:00.000Z',
    type: 'pantry',
    read: true,
  },
]

function cloneDefaultNotifications(): AppNotification[] {
  return defaultNotifications.map((notification) => ({ ...notification }))
}

function readStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') {
    return cloneDefaultNotifications()
  }

  const storedNotifications = window.localStorage.getItem(notificationStorageKey)

  if (!storedNotifications) {
    return cloneDefaultNotifications()
  }

  try {
    return JSON.parse(storedNotifications) as AppNotification[]
  } catch {
    return cloneDefaultNotifications()
  }
}

function writeStoredNotifications(notifications: AppNotification[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(notificationStorageKey, JSON.stringify(notifications))
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: readStoredNotifications(),
  }),
  getters: {
    allNotifications: (state): AppNotification[] =>
      [...state.notifications].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      ),
    unreadCount: (state): number =>
      state.notifications.filter((notification) => !notification.read).length,
  },
  actions: {
    markAsRead(notificationId: string) {
      const notification = this.notifications.find((item) => item.id === notificationId)

      if (!notification || notification.read) {
        return
      }

      notification.read = true
      writeStoredNotifications(this.notifications)
    },
    markAllAsRead() {
      if (this.notifications.every((notification) => notification.read)) {
        return
      }

      this.notifications = this.notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
      writeStoredNotifications(this.notifications)
    },
  },
})
