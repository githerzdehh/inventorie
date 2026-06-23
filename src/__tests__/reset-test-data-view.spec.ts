import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PantryItem, ScanRecord } from '@/composables/app-types'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import ResetTestDataView from '@/views/app/dev/ResetTestDataView.vue'

const pantryStorageMock = vi.hoisted(() => ({
  getPantryItems: vi.fn(),
  addPantryItems: vi.fn(),
  updatePantryItem: vi.fn(),
  deletePantryItem: vi.fn(),
  clearPantryItems: vi.fn(),
}))

const scanStorageMock = vi.hoisted(() => ({
  getScanRecords: vi.fn(),
  saveScanRecord: vi.fn(),
  deleteScanRecord: vi.fn(),
}))

const resetInventorieTestDataMock = vi.hoisted(() => vi.fn())

vi.mock('@/composables/usePantryStorage', () => ({
  usePantryStorage: () => pantryStorageMock,
}))

vi.mock('@/composables/useScanStorage', () => ({
  useScanStorage: () => scanStorageMock,
}))

vi.mock('@/composables/useInventorieTestDataReset', () => ({
  inventoriePreservedAuthStorageKeys: [
    'inventorie:auth-users',
    'inventorie:auth-config',
    'inventorie:auth-session',
  ],
  resetInventorieTestData: resetInventorieTestDataMock,
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

function renderResetView() {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().login('superadmin', 'super123')

  return render(ResetTestDataView, {
    global: {
      plugins: [pinia, vuetify],
    },
  })
}

describe('ResetTestDataView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    pantryStorageMock.getPantryItems.mockReset()
    pantryStorageMock.addPantryItems.mockReset()
    pantryStorageMock.updatePantryItem.mockReset()
    pantryStorageMock.deletePantryItem.mockReset()
    pantryStorageMock.clearPantryItems.mockReset()
    scanStorageMock.getScanRecords.mockReset()
    scanStorageMock.saveScanRecord.mockReset()
    scanStorageMock.deleteScanRecord.mockReset()
    resetInventorieTestDataMock.mockReset()
    resetInventorieTestDataMock.mockResolvedValue({
      localStorageKeysCleared: ['inventorie:pantry-items', 'inventorie:scan-records'],
      indexedDbStoresCleared: ['pantryItems', 'scanRecords'],
    })
  })

  it('resets scans and pantry while keeping the active auth session', async () => {
    pantryStorageMock.getPantryItems.mockResolvedValueOnce([makePantryItem()]).mockResolvedValue([])
    scanStorageMock.getScanRecords.mockResolvedValueOnce([makeScanRecord()]).mockResolvedValue([])

    renderResetView()

    await waitFor(() => {
      expect(screen.getByText('Pantry items')).toBeInTheDocument()
      expect(screen.getByText('Scan records')).toBeInTheDocument()
    })

    expect(window.localStorage.getItem('inventorie:auth-session')).toContain('super-admin')

    await fireEvent.click(screen.getByRole('button', { name: 'Reset scans and pantry' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Reset data' }))

    await waitFor(() => {
      expect(resetInventorieTestDataMock).toHaveBeenCalledOnce()
      expect(screen.getByText('Test data reset. Pantry and scan history are now empty.'))
        .toBeInTheDocument()
    })

    expect(pantryStorageMock.getPantryItems).toHaveBeenCalledTimes(2)
    expect(scanStorageMock.getScanRecords).toHaveBeenCalledTimes(2)
    expect(window.localStorage.getItem('inventorie:auth-session')).toContain('super-admin')
  })
})
