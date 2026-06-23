import { defineStore } from 'pinia'
import { mockNotifications } from '@/mocks/data/mock-app'

export type NotificationType = 'pantry' | 'recipe' | 'comparison' | 'system'

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

const defaultNotifications: AppNotification[] = mockNotifications

function cloneDefaultNotifications(): AppNotification[] {
  return defaultNotifications.map((notification) => ({ ...notification }))
}

function isNotificationType(value: unknown): value is NotificationType {
  return value === 'pantry' || value === 'recipe' || value === 'comparison' || value === 'system'
}

function isAppNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== 'object') {
    return false
  }

  const notification = value as Partial<AppNotification>

  return (
    typeof notification.id === 'string' &&
    typeof notification.title === 'string' &&
    typeof notification.description === 'string' &&
    typeof notification.createdAt === 'string' &&
    typeof notification.read === 'boolean' &&
    isNotificationType(notification.type)
  )
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
    const parsedNotifications = JSON.parse(storedNotifications) as unknown

    if (!Array.isArray(parsedNotifications)) {
      return cloneDefaultNotifications()
    }

    return parsedNotifications.filter(isAppNotification)
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
