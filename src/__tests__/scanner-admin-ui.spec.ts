import { render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ScanReceiptView from '@/views/app/scanner/ScanReceiptView.vue'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: { template: '<div />' },
      },
      {
        path: '/app/review-items',
        component: { template: '<div />' },
      },
      {
        path: '/app/scans',
        component: { template: '<div />' },
      },
    ],
  })
}

async function renderScanReceiptView(email: string, password: string) {
  const pinia = createPinia()
  const router = makeRouter()

  setActivePinia(pinia)
  useAuthStore().login(email, password)
  await router.push('/')

  return render(ScanReceiptView, {
    global: {
      plugins: [pinia, router, vuetify],
      stubs: {
        ReceiptUploader: true,
        ScanPreview: true,
      },
    },
  })
}

describe('scanner super admin UI', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.spyOn(console, 'info').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('hides sample receipt controls and diagnostics for subscribed users', async () => {
    await renderScanReceiptView('user@inventorie.local', 'user123')

    expect(screen.queryByText('Use Sample Scan')).not.toBeInTheDocument()
    expect(screen.queryByText('Scanner diagnostics')).not.toBeInTheDocument()
    expect(screen.queryByText(/OCR/i)).not.toBeInTheDocument()
  })

  it('hides sample receipt controls and diagnostics for admin users', async () => {
    await renderScanReceiptView('admin@inventorie.local', 'admin123')

    expect(screen.queryByText('Use Sample Scan')).not.toBeInTheDocument()
    expect(screen.queryByText('Scanner diagnostics')).not.toBeInTheDocument()
    expect(screen.queryByText(/OCR/i)).not.toBeInTheDocument()
  })

  it('shows sample receipt controls for super admin users', async () => {
    await renderScanReceiptView('superadmin@inventorie.local', 'super123')

    expect(screen.getByText('Use Sample Scan')).toBeInTheDocument()
  })
})
