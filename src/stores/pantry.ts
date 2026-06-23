import { defineStore } from 'pinia'
import type {
  DetectedReceiptItem,
  FreshnessStatus,
  PantryItem,
  PantryItemSource,
  ScanInputMethod,
  ScanRecord,
  StorageLocation,
} from '@/composables/app-types'
import { calculateUseByDate, getFreshnessStatus } from '@/composables/date-utils'
import { validateQuantityInput } from '@/composables/quantity-utils'
import { usePantryStorage } from '@/composables/usePantryStorage'
import { mockStorageRules } from '@/mocks/data/mock-storage-rules'

interface PantryState {
  items: PantryItem[]
  isLoading: boolean
  errorMessage: string | null
  successMessage: string | null
}

interface PantrySummary {
  total: number
  useSoon: number
  fresh: number
  pastSuggestedDate: number
}

const pantryStorage = usePantryStorage()
const validFreshnessStatuses = new Set<FreshnessStatus>([
  'expiring-today',
  'use-soon',
  'fresh',
  'past-suggested-date',
  'unknown',
])
const validStorageLocations = new Set<StorageLocation>(['pantry', 'refrigerator', 'freezer'])
const validPantryItemSources = new Set<PantryItemSource>(['receipt_scan', 'manual'])
const validScanInputMethods = new Set<ScanInputMethod>(['upload', 'capture', 'sample'])

function logPantry(level: 'info' | 'warning' | 'error', message: string, data?: unknown): void {
  const consoleMessage = `[Inventorie][Pantry][${level.toUpperCase()}] ${message}`

  if (level === 'error') {
    console.error(consoleMessage, data ?? {})
  } else if (level === 'warning') {
    console.warn(consoleMessage, data ?? {})
  } else {
    console.info(consoleMessage, data ?? {})
  }
}

function getStorageRule(ingredientId: string | null) {
  if (!ingredientId) {
    return null
  }

  return mockStorageRules.find((rule) => rule.ingredientId === ingredientId) ?? null
}

function makePantryItemId(index: number): string {
  if (globalThis.crypto?.randomUUID) {
    return `pantry-${globalThis.crypto.randomUUID()}`
  }

  return `pantry-${Date.now()}-${index}`
}

function toPantryItem(
  item: DetectedReceiptItem,
  index: number,
  createdAt: string,
  scanRecord?: ScanRecord | null,
): PantryItem {
  const storageRule = getStorageRule(item.ingredientId)
  const estimatedUseByDate = calculateUseByDate(createdAt, storageRule?.suggestedDays)
  const quantityResult = validateQuantityInput(item.quantity, item.unit)

  return {
    id: makePantryItemId(index),
    ingredientId: item.ingredientId,
    displayName: item.displayName,
    description: item.description?.trim() || null,
    quantity: quantityResult.quantity ?? 1,
    unit: item.unit,
    source: 'receipt_scan',
    purchaseDate: scanRecord?.scannedAt ?? createdAt,
    storageLocation: storageRule?.storageLocation ?? 'pantry',
    estimatedUseByDate,
    freshnessStatus: getFreshnessStatus(
      estimatedUseByDate,
      storageRule?.warningDaysBeforeExpiry ?? 2,
    ),
    addedAt: createdAt,
    scanRecordId: scanRecord?.id ?? null,
    scanCode: scanRecord?.scanCode ?? null,
    scannedAt: scanRecord?.scannedAt ?? null,
    scanInputMethod: scanRecord?.inputMethod ?? null,
    originalFileName: scanRecord?.originalFileName ?? null,
    rawScanLabel: item.rawLabel?.trim() || null,
    createdAt,
    updatedAt: createdAt,
  }
}

function normalizeFreshnessStatus(status: unknown): FreshnessStatus {
  return typeof status === 'string' && validFreshnessStatuses.has(status as FreshnessStatus)
    ? (status as FreshnessStatus)
    : 'unknown'
}

function normalizeStorageLocation(location: unknown): StorageLocation {
  return typeof location === 'string' && validStorageLocations.has(location as StorageLocation)
    ? (location as StorageLocation)
    : 'pantry'
}

function normalizePantryItemSource(source: unknown): PantryItemSource {
  return typeof source === 'string' && validPantryItemSources.has(source as PantryItemSource)
    ? (source as PantryItemSource)
    : 'manual'
}

function normalizeScanInputMethod(inputMethod: unknown): ScanInputMethod | null {
  return typeof inputMethod === 'string' &&
    validScanInputMethods.has(inputMethod as ScanInputMethod)
    ? (inputMethod as ScanInputMethod)
    : null
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeQuantity(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 1
}

function normalizePantryItem(item: unknown, index: number): PantryItem | null {
  if (!item || typeof item !== 'object') {
    logPantry('warning', 'Skipping malformed pantry item record.', {
      index,
    })

    return null
  }

  const record = item as Partial<PantryItem>
  const createdAt = normalizeString(record.createdAt, new Date(0).toISOString())
  const addedAt = normalizeString(record.addedAt, createdAt)
  const estimatedUseByDate = normalizeNullableString(record.estimatedUseByDate)
  const storageRule = getStorageRule(
    typeof record.ingredientId === 'string' ? record.ingredientId : null,
  )

  return {
    id: normalizeString(record.id, `pantry-malformed-${index}`),
    ingredientId: typeof record.ingredientId === 'string' ? record.ingredientId : null,
    displayName: normalizeString(record.displayName, 'Unnamed item'),
    description: normalizeNullableString(record.description),
    quantity: normalizeQuantity(record.quantity),
    unit: normalizeString(record.unit, 'item'),
    source: normalizePantryItemSource(record.source),
    purchaseDate: normalizeString(record.purchaseDate, record.scannedAt ?? addedAt),
    storageLocation: normalizeStorageLocation(
      record.storageLocation ?? storageRule?.storageLocation,
    ),
    estimatedUseByDate,
    freshnessStatus: estimatedUseByDate
      ? getFreshnessStatus(estimatedUseByDate, storageRule?.warningDaysBeforeExpiry ?? 2)
      : normalizeFreshnessStatus(record.freshnessStatus),
    addedAt,
    scanRecordId: normalizeNullableString(record.scanRecordId),
    scanCode: normalizeNullableString(record.scanCode),
    scannedAt: normalizeNullableString(record.scannedAt),
    scanInputMethod: normalizeScanInputMethod(record.scanInputMethod),
    originalFileName: normalizeNullableString(record.originalFileName),
    rawScanLabel: normalizeNullableString(record.rawScanLabel),
    createdAt,
    updatedAt: normalizeString(record.updatedAt, createdAt),
  }
}

function getStatusSortValue(status: unknown): number {
  const sortOrder: Record<FreshnessStatus, number> = {
    'past-suggested-date': 0,
    'expiring-today': 1,
    'use-soon': 2,
    fresh: 3,
    unknown: 4,
  }

  return sortOrder[normalizeFreshnessStatus(status)]
}

function sortPantryItems(items: PantryItem[]): PantryItem[] {
  return [...items].sort((first, second) => {
    const statusComparison =
      getStatusSortValue(first?.freshnessStatus) - getStatusSortValue(second?.freshnessStatus)

    if (statusComparison !== 0) {
      return statusComparison
    }

    return String(first?.displayName ?? 'Unnamed item').localeCompare(
      String(second?.displayName ?? 'Unnamed item'),
    )
  })
}

export const usePantryStore = defineStore('pantry', {
  state: (): PantryState => ({
    items: [],
    isLoading: false,
    errorMessage: null,
    successMessage: null,
  }),
  getters: {
    itemById: (state) => {
      return (id: string) =>
        Array.isArray(state.items) ? state.items.find((item) => item.id === id) : undefined
    },
    summary: (state): PantrySummary => ({
      total: Array.isArray(state.items) ? state.items.length : 0,
      useSoon: Array.isArray(state.items)
        ? state.items.filter(
            (item) => normalizeFreshnessStatus(item?.freshnessStatus) === 'use-soon',
          ).length
        : 0,
      fresh: Array.isArray(state.items)
        ? state.items.filter((item) => normalizeFreshnessStatus(item?.freshnessStatus) === 'fresh')
            .length
        : 0,
      pastSuggestedDate: Array.isArray(state.items)
        ? state.items.filter(
            (item) => normalizeFreshnessStatus(item?.freshnessStatus) === 'past-suggested-date',
          ).length
        : 0,
    }),
  },
  actions: {
    async loadPantryItems() {
      this.isLoading = true
      this.errorMessage = null
      this.successMessage = null
      logPantry('info', 'loadPantryItems started.')

      try {
        const items = await pantryStorage.getPantryItems()

        if (!Array.isArray(items)) {
          this.items = []
          logPantry('warning', 'Storage returned non-array pantry items. Using empty list.', {
            receivedType: typeof items,
          })

          return
        }

        const cleanItems = sortPantryItems(refreshItemsFreshness([...items]))
        this.items = cleanItems
        this.successMessage = 'Pantry items loaded.'

        logPantry('info', 'Loaded pantry item count.', {
          count: this.items.length,
        })
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Could not load pantry items.'
        this.items = []
        logPantry('error', 'loadPantryItems failed.', {
          error: this.errorMessage,
        })
      } finally {
        this.isLoading = false
      }
    },
    async addPantryItems(items: PantryItem[]) {
      const cleanItems = Array.isArray(items) ? [...items] : []

      logPantry('info', 'Saving pantry items.', {
        count: cleanItems.length,
      })
      await pantryStorage.addPantryItems(cleanItems)
      this.items = sortPantryItems([
        ...cleanItems,
        ...(Array.isArray(this.items) ? this.items : []),
      ])
      this.successMessage = 'Pantry items saved.'
      logPantry('info', 'Pantry items saved.', {
        count: cleanItems.length,
        total: this.items.length,
      })
    },
    async addDetectedItems(items: DetectedReceiptItem[], scanRecord?: ScanRecord | null) {
      const selectedItems = items.filter((item) => item.selected)
      const now = new Date().toISOString()
      const pantryItems = selectedItems.map((item, index) =>
        toPantryItem(item, index, now, scanRecord),
      )

      await this.addPantryItems(pantryItems)

      return pantryItems
    },
    async updatePantryItem(item: PantryItem) {
      const storageRule = getStorageRule(item.ingredientId)
      const quantityResult = validateQuantityInput(item.quantity, item.unit)

      if (quantityResult.errorMessage || !quantityResult.quantity) {
        throw new Error(quantityResult.errorMessage ?? 'Quantity is invalid.')
      }

      const updatedItem = {
        ...item,
        quantity: quantityResult.quantity,
        freshnessStatus: getFreshnessStatus(
          item.estimatedUseByDate,
          storageRule?.warningDaysBeforeExpiry ?? 2,
        ),
        updatedAt: new Date().toISOString(),
      }

      await pantryStorage.updatePantryItem(updatedItem)

      this.items = sortPantryItems(
        (Array.isArray(this.items) ? this.items : []).map((existingItem) =>
          existingItem.id === updatedItem.id ? updatedItem : existingItem,
        ),
      )
      this.successMessage = 'Pantry item updated.'
    },
    async deletePantryItem(id: string) {
      await pantryStorage.deletePantryItem(id)
      this.items = (Array.isArray(this.items) ? this.items : []).filter((item) => item.id !== id)
      this.successMessage = 'Pantry item deleted.'
    },
    async clearPantryItems() {
      await pantryStorage.clearPantryItems()
      this.items = []
      this.successMessage = 'Pantry cleared.'
    },
    async refreshFreshness() {
      const refreshedItems = refreshItemsFreshness(Array.isArray(this.items) ? this.items : [])

      await Promise.all(refreshedItems.map((item) => pantryStorage.updatePantryItem(item)))
      this.items = sortPantryItems(refreshedItems)
    },
  },
})

function refreshItemsFreshness(items: PantryItem[]): PantryItem[] {
  return items.flatMap((item, index) => {
    const normalizedItem = normalizePantryItem(item, index)

    if (!normalizedItem) {
      return []
    }

    const storageRule = getStorageRule(normalizedItem.ingredientId)

    return [
      {
        ...normalizedItem,
        freshnessStatus: getFreshnessStatus(
          normalizedItem.estimatedUseByDate,
          storageRule?.warningDaysBeforeExpiry ?? 2,
        ),
      },
    ]
  })
}

export const storageLocationLabels: Record<StorageLocation, string> = {
  pantry: 'Pantry',
  refrigerator: 'Refrigerator',
  freezer: 'Freezer',
}
