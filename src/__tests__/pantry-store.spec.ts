import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DetectedReceiptItem, PantryItem, ScanRecord } from '@/composables/app-types'
import { usePantryStore } from '@/stores/pantry'

const pantryStorageMock = vi.hoisted(() => ({
  getPantryItems: vi.fn(),
  addPantryItems: vi.fn(),
  updatePantryItem: vi.fn(),
  deletePantryItem: vi.fn(),
  clearPantryItems: vi.fn(),
}))

vi.mock('@/composables/usePantryStorage', () => ({
  usePantryStorage: () => pantryStorageMock,
}))

function makePantryItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: 'pantry-1',
    ingredientId: null,
    displayName: 'Milk',
    description: null,
    quantity: 1,
    unit: 'item',
    source: 'manual',
    purchaseDate: '2026-06-18T00:00:00.000Z',
    storageLocation: 'refrigerator',
    estimatedUseByDate: null,
    freshnessStatus: 'fresh',
    createdAt: '2026-06-18T00:00:00.000Z',
    updatedAt: '2026-06-18T00:00:00.000Z',
    ...overrides,
  }
}

function makeDetectedItem(overrides: Partial<DetectedReceiptItem> = {}): DetectedReceiptItem {
  return {
    id: 'detected-1-milk',
    rawLabel: 'MILK 1 L 120.00',
    ingredientId: 'ingredient-milk',
    displayName: 'Milk',
    description: null,
    quantity: 1,
    unit: 'liter',
    confidence: 0.88,
    selected: true,
    ...overrides,
  }
}

function makeScanRecord(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    scanCode: 'CVSCAN-20260618-120000-ABCD',
    alias: 'Uploaded source image',
    note: null,
    inputMethod: 'upload',
    originalFileName: 'grocery-upload.jpg',
    scannedAt: '2026-06-18T12:00:00.000Z',
    completedAt: '2026-06-18T12:00:05.000Z',
    itemCount: 1,
    savedItemCount: 0,
    ocrConfidence: 0.88,
    status: 'completed',
    createdAt: '2026-06-18T12:00:00.000Z',
    updatedAt: '2026-06-18T12:00:05.000Z',
    ...overrides,
  }
}

describe('pantry store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pantryStorageMock.getPantryItems.mockReset()
    pantryStorageMock.addPantryItems.mockReset()
    pantryStorageMock.updatePantryItem.mockReset()
    pantryStorageMock.deletePantryItem.mockReset()
    pantryStorageMock.clearPantryItems.mockReset()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([null, undefined, { item: makePantryItem() }])(
    'loads an empty array when storage returns %s',
    async (storageResult) => {
      pantryStorageMock.getPantryItems.mockResolvedValue(storageResult)

      const pantryStore = usePantryStore()

      await pantryStore.loadPantryItems()

      expect(pantryStore.items).toEqual([])
      expect(pantryStore.isLoading).toBe(false)
      expect(pantryStore.errorMessage).toBeNull()
      expect(console.warn).toHaveBeenCalledWith(
        '[Inventorie][Pantry][WARNING] Storage returned non-array pantry items. Using empty list.',
        expect.any(Object),
      )
    },
  )

  it('normalizes invalid freshness statuses to unknown when loading items', async () => {
    pantryStorageMock.getPantryItems.mockResolvedValue([
      makePantryItem({
        freshnessStatus: 'invalid-status' as PantryItem['freshnessStatus'],
        estimatedUseByDate: null,
      }),
    ])

    const pantryStore = usePantryStore()

    await pantryStore.loadPantryItems()

    expect(pantryStore.items).toHaveLength(1)
    expect(pantryStore.items[0]?.freshnessStatus).toBe('unknown')
  })

  it('adds detected items with scan provenance fields', async () => {
    const pantryStore = usePantryStore()
    const scanRecord = makeScanRecord()

    const pantryItems = await pantryStore.addDetectedItems([makeDetectedItem()], scanRecord)

    expect(pantryStorageMock.addPantryItems).toHaveBeenCalledWith([
      expect.objectContaining({
        source: 'receipt_scan',
        scanRecordId: scanRecord.id,
        scanCode: scanRecord.scanCode,
        scannedAt: scanRecord.scannedAt,
        scanInputMethod: scanRecord.inputMethod,
        originalFileName: scanRecord.originalFileName,
        rawScanLabel: 'MILK 1 L 120.00',
        addedAt: expect.any(String),
      }),
    ])
    expect(pantryItems[0]).toMatchObject({
      scanRecordId: scanRecord.id,
      scanCode: scanRecord.scanCode,
    })
  })

  it('rejects decimal quantities for item-style units when updating', async () => {
    const pantryStore = usePantryStore()

    await expect(
      pantryStore.updatePantryItem(makePantryItem({ quantity: 1.5, unit: 'item' })),
    ).rejects.toThrow('Quantity must be a whole number for this unit.')
    expect(pantryStorageMock.updatePantryItem).not.toHaveBeenCalled()
  })
})
