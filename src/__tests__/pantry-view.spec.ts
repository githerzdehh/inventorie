import { render, screen, waitFor } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PantryItem } from '@/composables/app-types'
import PantryView from '@/views/app/pantry/PantryView.vue'
import vuetify from '@/plugins/vuetify'

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

function daysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)

  return date.toISOString()
}

function renderPantryView() {
  return render(PantryView, {
    global: {
      plugins: [createPinia(), vuetify],
    },
  })
}

describe('PantryView', () => {
  beforeEach(() => {
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

  it('renders the empty pantry state without crashing', async () => {
    pantryStorageMock.getPantryItems.mockResolvedValue([])

    const { container } = renderPantryView()

    await waitFor(() => {
      expect(pantryStorageMock.getPantryItems).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByText('Your pantry is empty')).toBeInTheDocument()
      expect(screen.getByText('New scan')).toBeInTheDocument()
    })

    expect(container.querySelectorAll('.pantry-view__group')).toHaveLength(0)
  })

  it('renders date added and expiration metadata on pantry cards', async () => {
    pantryStorageMock.getPantryItems.mockResolvedValue([
      makePantryItem({
        addedAt: '2026-06-19T00:00:00.000Z',
        estimatedUseByDate: '2026-06-25T00:00:00.000Z',
      }),
    ])

    renderPantryView()

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText(/Added/)).toBeInTheDocument()
      expect(screen.getByText(/Expiration/)).toBeInTheDocument()
    })
  })

  it('renders normalized groups in order without duplicate key warnings', async () => {
    pantryStorageMock.getPantryItems.mockResolvedValue([
      makePantryItem({
        id: 'duplicate-id',
        displayName: 'Yogurt',
        estimatedUseByDate: daysFromNow(1),
        freshnessStatus: 'use-soon',
      }),
      makePantryItem({
        id: 'duplicate-id',
        displayName: 'Apples',
        estimatedUseByDate: daysFromNow(10),
        freshnessStatus: 'fresh',
      }),
      makePantryItem({
        id: 'mystery',
        displayName: 'Mystery jar',
        freshnessStatus: 'not-real' as PantryItem['freshnessStatus'],
      }),
    ])

    const { container } = renderPantryView()

    await waitFor(() => {
      expect(screen.getByText('Mystery jar')).toBeInTheDocument()
    })

    const groupLabels = Array.from(
      container.querySelectorAll('.pantry-view__group-heading h3'),
    ).map((heading) => heading.textContent)
    const warningOutput = vi
      .mocked(console.warn)
      .mock.calls.map((call) => call.map(String).join(' '))
      .join(' ')

    expect(groupLabels).toEqual(['Use Soon', 'Fresh', 'Unknown'])
    expect(new Set(groupLabels).size).toBe(groupLabels.length)
    expect(warningOutput).not.toContain('Duplicate keys')
  })
})
