import { defineStore } from 'pinia'
import type { PantryItem, StorageLocation } from '@/composables/app-types'
import { usePantryStore } from '@/stores/pantry'

export type NotificationType = 'friend_gift' | 'system'

export type NotificationReadState = 'read' | 'unread'

export type FriendGiftActionStatus = 'pending' | 'accepted' | 'declined'

export interface NotificationSender {
  id: string
  displayName: string
  avatarUrl: string | null
}

export interface GiftedPantryItem {
  id: string
  ingredientId: string | null
  displayName: string
  description: string | null
  quantity: number
  unit: string
  storageLocation: StorageLocation
  estimatedUseByDate: string | null
}

export interface FriendGiftPayload {
  id: string
  message: string
  status: FriendGiftActionStatus
  giftedAt: string
  items: GiftedPantryItem[]
}

export interface Notification {
  id: string
  type: NotificationType
  readState: NotificationReadState
  title: string
  message: string
  sender: NotificationSender | null
  gift: FriendGiftPayload | null
  createdAt: string
  updatedAt: string
}

interface NotificationsState {
  notifications: Notification[]
}

const mockNotifications: Notification[] = [
  {
    id: 'notification-friend-gift-maya-vegetables',
    type: 'friend_gift',
    readState: 'unread',
    title: 'Maya sent you pantry items',
    message: 'Maya shared extra vegetables from her weekend market run.',
    sender: {
      id: 'friend-maya-santos',
      displayName: 'Maya Santos',
      avatarUrl: null,
    },
    gift: {
      id: 'gift-maya-vegetables-2026-06-18',
      message: 'I bought too much for meal prep. Hope these help!',
      status: 'pending',
      giftedAt: '2026-06-18T08:20:00.000Z',
      items: [
        {
          id: 'gift-item-maya-carrots',
          ingredientId: 'ingredient-carrot',
          displayName: 'Carrots',
          description: 'Market fresh carrots from Maya',
          quantity: 1,
          unit: 'bag',
          storageLocation: 'refrigerator',
          estimatedUseByDate: '2026-06-25T08:20:00.000Z',
        },
        {
          id: 'gift-item-maya-broccoli',
          ingredientId: 'ingredient-broccoli',
          displayName: 'Broccoli',
          description: 'One head of broccoli from Maya',
          quantity: 1,
          unit: 'head',
          storageLocation: 'refrigerator',
          estimatedUseByDate: '2026-06-23T08:20:00.000Z',
        },
      ],
    },
    createdAt: '2026-06-18T08:20:00.000Z',
    updatedAt: '2026-06-18T08:20:00.000Z',
  },
  {
    id: 'notification-system-offline-ready',
    type: 'system',
    readState: 'read',
    title: 'Offline pantry is ready',
    message: 'Your pantry data is available when your connection is spotty.',
    sender: null,
    gift: null,
    createdAt: '2026-06-17T14:05:00.000Z',
    updatedAt: '2026-06-17T14:10:00.000Z',
  },
]

function makeGiftedPantryItemId(notificationId: string, giftedItemId: string): string {
  return `pantry-${notificationId}-${giftedItemId}`
}

function toPantryItem(
  notification: Notification,
  giftedItem: GiftedPantryItem,
  acceptedAt: string,
): PantryItem {
  return {
    id: makeGiftedPantryItemId(notification.id, giftedItem.id),
    ingredientId: giftedItem.ingredientId,
    displayName: giftedItem.displayName,
    description: giftedItem.description,
    quantity: giftedItem.quantity,
    unit: giftedItem.unit,
    source: 'manual',
    purchaseDate: notification.gift?.giftedAt ?? acceptedAt,
    storageLocation: giftedItem.storageLocation,
    estimatedUseByDate: giftedItem.estimatedUseByDate,
    freshnessStatus: 'unknown',
    addedAt: acceptedAt,
    scanRecordId: null,
    scanCode: null,
    scannedAt: null,
    scanInputMethod: null,
    originalFileName: null,
    rawScanLabel: null,
    createdAt: acceptedAt,
    updatedAt: acceptedAt,
  }
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [...mockNotifications],
  }),
  getters: {
    allNotifications: (state): Notification[] => state.notifications,
    unreadNotifications: (state): Notification[] =>
      state.notifications.filter((notification) => notification.readState === 'unread'),
    unreadCount(): number {
      return this.unreadNotifications.length
    },
    notificationById: (state) => {
      return (id: string): Notification | undefined =>
        state.notifications.find((notification) => notification.id === id)
    },
  },
  actions: {
    markAsRead(id: string) {
      const notification = this.notificationById(id)

      if (!notification || notification.readState === 'read') {
        return
      }

      notification.readState = 'read'
      notification.updatedAt = new Date().toISOString()
    },
    markAllAsRead() {
      const readAt = new Date().toISOString()

      this.notifications.forEach((notification) => {
        if (notification.readState === 'unread') {
          notification.readState = 'read'
          notification.updatedAt = readAt
        }
      })
    },
    async acceptFriendGift(id: string) {
      const notification = this.notificationById(id)

      if (
        !notification ||
        notification.type !== 'friend_gift' ||
        !notification.gift ||
        notification.gift.status === 'accepted' ||
        notification.gift.status === 'declined'
      ) {
        return
      }

      const acceptedAt = new Date().toISOString()
      const pantryItems = notification.gift.items.map((item) =>
        toPantryItem(notification, item, acceptedAt),
      )

      await usePantryStore().addPantryItems(pantryItems)

      notification.readState = 'read'
      notification.gift.status = 'accepted'
      notification.updatedAt = acceptedAt
    },
    declineFriendGift(id: string) {
      const notification = this.notificationById(id)

      if (
        !notification ||
        notification.type !== 'friend_gift' ||
        !notification.gift ||
        notification.gift.status === 'declined' ||
        notification.gift.status === 'accepted'
      ) {
        return
      }

      notification.readState = 'read'
      notification.gift.status = 'declined'
      notification.updatedAt = new Date().toISOString()
    },
  },
})
