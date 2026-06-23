import type { FreshnessStatus, PantryItem, StorageLocation } from '@/composables/app-types'

export interface GiftPantryItemInput {
  id?: string | null
  giftId?: string | null
  ingredientId?: string | null
  displayName?: string | null
  name?: string | null
  title?: string | null
  description?: string | null
  quantity?: number | null
  unit?: string | null
  storageLocation?: StorageLocation | string | null
  estimatedUseByDate?: string | null
  freshnessStatus?: FreshnessStatus | string | null
  purchaseDate?: string | null
  giftedAt?: string | null
  sharedAt?: string | null
  sentAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const validStorageLocations = new Set<StorageLocation>(['pantry', 'refrigerator', 'freezer'])
const validFreshnessStatuses = new Set<FreshnessStatus>([
  'fresh',
  'use-soon',
  'expiring-today',
  'past-suggested-date',
  'unknown',
])

function makeGiftPantryItemId(giftItem: GiftPantryItemInput, index: number): string {
  const sourceId = giftItem.id ?? giftItem.giftId

  if (typeof sourceId === 'string' && sourceId.trim()) {
    return `gift-pantry-${sourceId.trim()}-${index}`
  }

  if (globalThis.crypto?.randomUUID) {
    return `gift-pantry-${globalThis.crypto.randomUUID()}`
  }

  return `gift-pantry-${Date.now()}-${index}`
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeQuantity(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1
}

function normalizeStorageLocation(location: unknown): StorageLocation {
  return typeof location === 'string' && validStorageLocations.has(location as StorageLocation)
    ? (location as StorageLocation)
    : 'pantry'
}

function normalizeFreshnessStatus(status: unknown): FreshnessStatus {
  return typeof status === 'string' && validFreshnessStatuses.has(status as FreshnessStatus)
    ? (status as FreshnessStatus)
    : 'unknown'
}

function getGiftTimestamp(giftItem: GiftPantryItemInput): string | null {
  return (
    normalizeNullableString(giftItem.purchaseDate) ??
    normalizeNullableString(giftItem.giftedAt) ??
    normalizeNullableString(giftItem.sharedAt) ??
    normalizeNullableString(giftItem.sentAt) ??
    normalizeNullableString(giftItem.createdAt) ??
    normalizeNullableString(giftItem.updatedAt)
  )
}

export function toGiftPantryItem(
  giftItem: GiftPantryItemInput,
  index: number,
  acceptedAt: string,
): PantryItem {
  const acceptedTimestamp = normalizeString(acceptedAt, new Date().toISOString())
  const purchaseDate = getGiftTimestamp(giftItem) ?? acceptedTimestamp
  const displayName =
    normalizeNullableString(giftItem.displayName) ??
    normalizeNullableString(giftItem.name) ??
    normalizeNullableString(giftItem.title) ??
    'Gift item'

  return {
    id: makeGiftPantryItemId(giftItem, index),
    ingredientId: normalizeNullableString(giftItem.ingredientId),
    displayName,
    description: normalizeNullableString(giftItem.description),
    quantity: normalizeQuantity(giftItem.quantity),
    unit: normalizeString(giftItem.unit, 'item'),
    source: 'manual',
    purchaseDate,
    storageLocation: normalizeStorageLocation(giftItem.storageLocation),
    estimatedUseByDate: normalizeNullableString(giftItem.estimatedUseByDate),
    freshnessStatus: normalizeFreshnessStatus(giftItem.freshnessStatus),
    createdAt: acceptedTimestamp,
    updatedAt: acceptedTimestamp,
  }
}
