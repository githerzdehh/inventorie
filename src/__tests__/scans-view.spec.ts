import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScanRecord } from '@/composables/app-types'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import ScansView from '@/views/app/scanner/ScansView.vue'

const scanStorageMock = vi.hoisted(() => ({
  getScanRecords: vi.fn(),
  saveScanRecord: vi.fn(),
  deleteScanRecord: vi.fn(),
}))

vi.mock('@/composables/useScanStorage', () => ({
  useScanStorage: () => scanStorageMock,
}))

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: { template: '<div />' },
      },
      {
        path: '/app/scan',
        component: { template: '<div />' },
      },
    ],
  })
}

function makeScanRecord(overrides: Partial<ScanRecord> = {}): ScanRecord {
  return {
    id: 'scan-1',
    scanCode: 'CVSCAN-20260619-101500-CAFE',
    alias: 'Uploaded grocery source',
    note: 'Reference upload',
    inputMethod: 'upload',
    originalFileName: 'weekly-groceries.jpg',
    imagePreviewDataUrl: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    imagePreviewWidth: 1200,
    imagePreviewHeight: 1600,
    imagePreviewByteSize: 2048,
    scannedAt: '2026-06-19T10:15:00.000Z',
    completedAt: '2026-06-19T10:15:08.000Z',
    itemCount: 4,
    savedItemCount: 3,
    ocrConfidence: 0.91,
    status: 'saved',
    createdAt: '2026-06-19T10:15:00.000Z',
    updatedAt: '2026-06-19T10:16:00.000Z',
    ...overrides,
  }
}

describe('ScansView', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    scanStorageMock.getScanRecords.mockReset()
    scanStorageMock.saveScanRecord.mockReset()
    scanStorageMock.deleteScanRecord.mockReset()
  })

  it('hides technical scan details for subscribed users', async () => {
    const router = makeRouter()
    const pinia = createPinia()

    setActivePinia(pinia)
    useAuthStore().login('diane@inventorie.local', 'diane123')
    scanStorageMock.getScanRecords.mockResolvedValue([makeScanRecord()])
    await router.push('/')

    render(ScansView, {
      global: {
        plugins: [pinia, router, vuetify],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Scan records are managed automatically')).toBeInTheDocument()
    })

    expect(screen.queryByText('CVSCAN-20260619-101500-CAFE')).not.toBeInTheDocument()
    expect(screen.queryByText('OCR confidence')).not.toBeInTheDocument()
    expect(screen.queryByText('weekly-groceries.jpg')).not.toBeInTheDocument()
  })

  it('renders persisted scan image details for super admin users', async () => {
    const router = makeRouter()
    const pinia = createPinia()

    setActivePinia(pinia)
    useAuthStore().login('superadmin@inventorie.local', 'super123')
    scanStorageMock.getScanRecords.mockResolvedValue([makeScanRecord()])
    await router.push('/')

    render(ScansView, {
      global: {
        plugins: [pinia, router, vuetify],
      },
    })

    await waitFor(() => {
      expect(screen.getByText('CVSCAN-20260619-101500-CAFE')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: 'View details' }))

    expect(screen.getByText('1200x1600')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Open image' }))

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Rotate right')).toBeInTheDocument()
  })
})
