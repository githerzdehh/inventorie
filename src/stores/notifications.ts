import { defineStore } from 'pinia'
import type { PantryItem } from '@/composables/app-types'
import { usePantryStore } from '@/stores/pantry'

export type NotificationKind = 'friend_gift' | 'restock' | 'freshness'
export type GiftDecision = 'pending' | 'accepted' | 'declined'

export interface GiftItem {
  id: string
  displayName: string
  quantity: number
  unit: string
  note: string
  storageLocation: PantryItem['storageLocation']
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  receivedAt: string
  senderName?: string
  senderAvatar?: string
  unread: boolean
  giftStatus?: GiftDecision
  giftItems?: GiftItem[]
}

interface NotificationsState {
  notifications: AppNotification[]
  isProcessingGift: boolean
  errorMessage: string | null
  successMessage: string | null
}

const initialNotifications: AppNotification[] = [
  {
    id: 'friend-gift-001',
    kind: 'friend_gift',
    title: 'Friend Gift',
    message: 'Maya sent you a grocery gift with fresh produce and pantry staples.',
    receivedAt: '2026-06-22T16:30:00.000Z',
    senderName: 'Maya Santos',
    senderAvatar: 'MS',
    unread: true,
    giftStatus: 'pending',
    giftItems: [
      {
        id: 'gift-avocado',
        displayName: 'Avocados',
        quantity: 4,
        unit: 'pcs',
        note: 'Ripe in 1–2 days',
        storageLocation: 'pantry',
      },
      {
        id: 'gift-oat-milk',
        displayName: 'Oat milk',
        quantity: 2,
        unit: 'cartons',
        note: 'Shelf stable until opened',
        storageLocation: 'pantry',
      },
      {
        id: 'gift-spinach',
        displayName: 'Baby spinach',
        quantity: 1,
        unit: 'bag',
        note: 'Keep refrigerated',
        storageLocation: 'refrigerator',
      },
    ],
  },
  {
    id: 'restock-001',
    kind: 'restock',
    title: 'Low pantry reminder',
    message: 'Your flour supply may be running low based on recent scans.',
    receivedAt: '2026-06-21T09:15:00.000Z',
    unread: false,
  },
  {
    id: 'freshness-001',
    kind: 'freshness',
    title: 'Use soon',
    message: 'Two items in your refrigerator are nearing their suggested use-by dates.',
    receivedAt: '2026-06-20T12:10:00.000Z',
    unread: false,
  },
]

function makeGiftPantryId(giftId: string, itemId: string): string {
  return `gift-${giftId}-${itemId}-${Date.now()}`
}

function toGiftPantryItems(notification: AppNotification): PantryItem[] {
  const now = new Date().toISOString()

  return (notification.giftItems ?? []).map((item) => ({
    id: makeGiftPantryId(notification.id, item.id),
    ingredientId: null,
    displayName: item.displayName,
    description: `Gift from ${notification.senderName ?? 'a friend'}: ${item.note}`,
    quantity: item.quantity,
    unit: item.unit,
    source: 'manual',
    purchaseDate: now,
    storageLocation: item.storageLocation,
    estimatedUseByDate: null,
    freshnessStatus: 'unknown',
    addedAt: now,
    scanRecordId: null,
    scanCode: null,
    scannedAt: null,
    scanInputMethod: null,
    originalFileName: null,
    rawScanLabel: `Friend gift ${notification.id}`,
    createdAt: now,
    updatedAt: now,
  }))
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: initialNotifications,
    isProcessingGift: false,
    errorMessage: null,
    successMessage: null,
  }),
  getters: {
    notificationById: (state) => (id: string) => state.notifications.find((item) => item.id === id),
    unreadCount: (state) => state.notifications.filter((item) => item.unread).length,
  },
  actions: {
    markRead(id: string) {
      const notification = this.notifications.find((item) => item.id === id)

      if (notification) {
        notification.unread = false
      }
    },
    async acceptFriendGift(id: string) {
      const notification = this.notificationById(id)

      if (!notification || notification.kind !== 'friend_gift') {
        throw new Error('Gift notification was not found.')
      }

      this.isProcessingGift = true
      this.errorMessage = null
      this.successMessage = null

      try {
        const pantryStore = usePantryStore()
        await pantryStore.addPantryItems(toGiftPantryItems(notification))
        notification.giftStatus = 'accepted'
        notification.unread = false
        this.successMessage = 'Gift accepted and added to your pantry.'
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Could not accept this gift.'
        throw error
      } finally {
        this.isProcessingGift = false
      }
    },
    declineFriendGift(id: string) {
      const notification = this.notificationById(id)

      if (!notification || notification.kind !== 'friend_gift') {
        throw new Error('Gift notification was not found.')
      }

      notification.giftStatus = 'declined'
      notification.unread = false
      this.successMessage = 'Gift declined.'
    },
  },
})
