import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import vuetify from '@/plugins/vuetify'
import RecipeSuggestionsView from '@/views/app/recipes/RecipeSuggestionsView.vue'

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

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/app/cook', component: RecipeSuggestionsView },
      { path: '/app/pantry', component: { template: '<div />' } },
      { path: '/app/recipes/:id', component: { template: '<div />' } },
      { path: '/app/saved', component: { template: '<div />' } },
    ],
  })
}

async function renderView() {
  const router = makeRouter()
  await router.push('/app/cook')
  await router.isReady()

  return render(RecipeSuggestionsView, {
    global: {
      plugins: [createPinia(), router, vuetify],
    },
  })
}

describe('RecipeSuggestionsView', () => {
  beforeEach(() => {
    pantryStorageMock.getPantryItems.mockResolvedValue([
      {
        id: 'pantry-1',
        ingredientId: 'ingredient-rice',
        displayName: 'Rice',
        description: null,
        quantity: 1,
        unit: 'item',
        source: 'manual',
        purchaseDate: '2026-06-18T00:00:00.000Z',
        storageLocation: 'pantry',
        estimatedUseByDate: null,
        freshnessStatus: 'fresh',
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      {
        id: 'pantry-2',
        ingredientId: 'ingredient-chicken',
        displayName: 'Chicken',
        description: null,
        quantity: 1,
        unit: 'item',
        source: 'manual',
        purchaseDate: '2026-06-18T00:00:00.000Z',
        storageLocation: 'pantry',
        estimatedUseByDate: null,
        freshnessStatus: 'fresh',
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      {
        id: 'pantry-3',
        ingredientId: 'ingredient-ginger',
        displayName: 'Ginger',
        description: null,
        quantity: 1,
        unit: 'item',
        source: 'manual',
        purchaseDate: '2026-06-18T00:00:00.000Z',
        storageLocation: 'pantry',
        estimatedUseByDate: null,
        freshnessStatus: 'fresh',
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      {
        id: 'pantry-4',
        ingredientId: 'ingredient-onion',
        displayName: 'Onion',
        description: null,
        quantity: 1,
        unit: 'item',
        source: 'manual',
        purchaseDate: '2026-06-18T00:00:00.000Z',
        storageLocation: 'pantry',
        estimatedUseByDate: null,
        freshnessStatus: 'fresh',
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
      {
        id: 'pantry-5',
        ingredientId: 'ingredient-pechay',
        displayName: 'Pechay',
        description: null,
        quantity: 1,
        unit: 'item',
        source: 'manual',
        purchaseDate: '2026-06-18T00:00:00.000Z',
        storageLocation: 'pantry',
        estimatedUseByDate: null,
        freshnessStatus: 'fresh',
        createdAt: '2026-06-18T00:00:00.000Z',
        updatedAt: '2026-06-18T00:00:00.000Z',
      },
    ])
  })

  it('defaults to browse recipes and shows inventory-aware matches', async () => {
    await renderView()

    expect(screen.getByRole('tab', { name: 'Browse Recipes' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Best from your inventory')).toBeInTheDocument()
    expect(screen.getByText('Browse the catalog')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('switches to inventory-first sections', async () => {
    await renderView()

    await fireEvent.click(screen.getByRole('tab', { name: 'From Inventory' }))

    await waitFor(() => {
      expect(screen.getByText('Inventory ingredients')).toBeInTheDocument()
      expect(screen.getByText('Ready to cook')).toBeInTheDocument()
      expect(screen.getByText('Almost ready')).toBeInTheDocument()
    })
  })
})
