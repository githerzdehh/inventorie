import { render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PantryItem, ScanRecord } from '@/composables/app-types'
import vuetify from '@/plugins/vuetify'
import { usePantryStore } from '@/stores/pantry'
import { useScansStore } from '@/stores/scans'
import PantryItemView from '@/views/app/pantry/PantryItemView.vue'

let pinia: ReturnType<typeof createPinia>

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      id: 'pantry-1',
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

function makePantryItem(overrides: Partial<PantryItem> = {}): PantryItem {
  return {
    id: 'pantry-1',
    ingredientId: 'ingredient-milk',
    displayName: 'Milk',
    description: null,
    quantity: 1,
    unit: 'liter',
    source: 'receipt_scan',
    purchaseDate: '2026-06-18T12:00:00.000Z',
    storageLocation: 'refrigerator',
    estimatedUseByDate: '2026-06-25T00:00:00.000Z',
    freshnessStatus: 'fresh',
    addedAt: '2026-06-19T12:00:00.000Z',
    scanRecordId: 'scan-1',
    scanCode: 'CVSCAN-20260618-120000-ABCD',
    scannedAt: '2026-06-18T12:00:00.000Z',
    scanInputMethod: 'upload',
    originalFileName: 'grocery-upload.jpg',
    rawScanLabel: 'MILK 1 L 120.00',
    createdAt: '2026-06-19T12:00:00.000Z',
    updatedAt: '2026-06-19T12:00:00.000Z',
    ...overrides,
  }
}

function makeScanRecord(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    scanCode: 'CVSCAN-20260618-120000-ABCD',
    alias: 'Weekly groceries',
    note: 'Phone upload',
    inputMethod: 'upload',
    originalFileName: 'grocery-upload.jpg',
    scannedAt: '2026-06-18T12:00:00.000Z',
    completedAt: '2026-06-18T12:00:05.000Z',
    itemCount: 1,
    savedItemCount: 1,
    ocrConfidence: 0.88,
    status: 'saved',
    createdAt: '2026-06-18T12:00:00.000Z',
    updatedAt: '2026-06-19T12:00:00.000Z',
    ...overrides,
  }
}

describe('PantryItemView', () => {
  beforeEach(() => {
    pinia = createPinia()

    setActivePinia(pinia)
    usePantryStore().items = [makePantryItem()]
    useScansStore().records = [makeScanRecord()]
  })

  it('renders pantry and scan provenance details', async () => {
    render(PantryItemView, {
      global: {
        plugins: [pinia, vuetify],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText('CVSCAN-20260618-120000-ABCD')).toBeInTheDocument()
      expect(screen.getByText('Weekly groceries')).toBeInTheDocument()
      expect(screen.getByText('Phone upload')).toBeInTheDocument()
      expect(screen.getByText('Upload image')).toBeInTheDocument()
      expect(screen.getByText('grocery-upload.jpg')).toBeInTheDocument()
      expect(screen.getByText('MILK 1 L 120.00')).toBeInTheDocument()
    })
  })
})
