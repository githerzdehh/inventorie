import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScanRecord } from '@/composables/app-types'
import { useScansStore } from '@/stores/scans'

const scanStorageMock = vi.hoisted(() => ({
  getScanRecords: vi.fn(),
  saveScanRecord: vi.fn(),
  deleteScanRecord: vi.fn(),
}))

vi.mock('@/composables/useScanStorage', () => ({
  useScanStorage: () => scanStorageMock,
}))

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

describe('scans store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    scanStorageMock.getScanRecords.mockReset()
    scanStorageMock.saveScanRecord.mockReset()
    scanStorageMock.deleteScanRecord.mockReset()
  })

  it('loads scan records newest first', async () => {
    scanStorageMock.getScanRecords.mockResolvedValue([
      makeScanRecord({ id: 'scan-old', scannedAt: '2026-06-18T12:00:00.000Z' }),
      makeScanRecord({ id: 'scan-new', scannedAt: '2026-06-19T12:00:00.000Z' }),
    ])

    const scansStore = useScansStore()

    await scansStore.loadScanRecords()

    expect(scansStore.records.map((record) => record.id)).toEqual(['scan-new', 'scan-old'])
  })

  it('updates scan alias and note', async () => {
    scanStorageMock.getScanRecords.mockResolvedValue([makeScanRecord()])

    const scansStore = useScansStore()

    await scansStore.loadScanRecords()
    await scansStore.updateScanRecord('scan-1', {
      alias: 'Weekly groceries',
      note: 'Imported from phone upload.',
    })

    expect(scanStorageMock.saveScanRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'scan-1',
        alias: 'Weekly groceries',
        note: 'Imported from phone upload.',
      }),
    )
    expect(scansStore.recordById('scan-1')?.alias).toBe('Weekly groceries')
  })
})
