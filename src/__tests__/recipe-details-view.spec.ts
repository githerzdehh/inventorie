import { render, screen } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import vuetify from '@/plugins/vuetify'
import RecipeDetailsView from '@/views/app/recipes/RecipeDetailsView.vue'

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
    routes: [{ path: '/app/recipes/:id', component: RecipeDetailsView }],
  })
}

async function renderView() {
  const router = makeRouter()
  await router.push('/app/recipes/recipe-chicken-tinola-bowl')
  await router.isReady()

  return render(RecipeDetailsView, {
    global: {
      plugins: [createPinia(), router, vuetify],
    },
  })
}

describe('RecipeDetailsView', () => {
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

  it('renders inventory, needed, and optional ingredient groups', async () => {
    await renderView()

    expect(screen.getByText('Chicken Tinola Bowl')).toBeInTheDocument()
    expect(screen.getByText('In inventory')).toBeInTheDocument()
    expect(screen.getByText('Needed')).toBeInTheDocument()
    expect(screen.getByText('Optional')).toBeInTheDocument()
    expect(screen.getByText('Scallions')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Share recipe' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })
})
