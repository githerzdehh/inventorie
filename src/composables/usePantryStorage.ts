import type { PantryItem } from '@/composables/app-types'
import {
  getInventorieDatabase,
  logInventorieStorage,
  markInventorieDexieUnavailable,
  type InventorieStorageBackend,
} from '@/composables/useInventorieDatabase'
import { mockPantryItems } from '@/mocks/data/mock-app'

const localStorageKey = 'inventorie:pantry-items'

function logPantryStorage(
  level: 'info' | 'warning' | 'error',
  message: string,
  data?: unknown,
): void {
  logInventorieStorage('Pantry', level, message, data)
}

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizePantryItems(value: unknown, source: InventorieStorageBackend): PantryItem[] {
  if (!Array.isArray(value)) {
    logPantryStorage(
      'warning',
      `Pantry items from ${source} were not an array. Using empty list.`,
      {
        backend: source,
      },
    )

    return []
  }

  return [...value] as PantryItem[]
}

function getLocalStorageItems(): PantryItem[] {
  if (!canUseBrowserStorage()) {
    return []
  }

  try {
    const rawItems = window.localStorage.getItem(localStorageKey)

    if (!rawItems) {
      return []
    }

    const parsedItems = JSON.parse(rawItems)

    if (!Array.isArray(parsedItems)) {
      window.localStorage.removeItem(localStorageKey)
      logPantryStorage('warning', 'Malformed localStorage pantry items were cleared.', {
        backend: 'localStorage' as InventorieStorageBackend,
      })

      return []
    }

    return normalizePantryItems(parsedItems, 'localStorage')
  } catch {
    window.localStorage.removeItem(localStorageKey)
    logPantryStorage('warning', 'Invalid localStorage pantry items were cleared.', {
      backend: 'localStorage' as InventorieStorageBackend,
    })

    return []
  }
}

function setLocalStorageItems(items: PantryItem[]): void {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.setItem(
    localStorageKey,
    JSON.stringify(normalizePantryItems(items, 'localStorage')),
  )
}

function sortPantryItems(items: PantryItem[]): PantryItem[] {
  return [...items].sort((first, second) =>
    String(second?.addedAt ?? second?.createdAt ?? '').localeCompare(
      String(first?.addedAt ?? first?.createdAt ?? ''),
    ),
  )
}

function getDefaultPantryItems(): PantryItem[] {
  return mockPantryItems.map((item) => ({ ...item }))
}

async function getPantryItems(): Promise<PantryItem[]> {
  try {
    const db = await getInventorieDatabase()

    if (!db) {
      const localItems = getLocalStorageItems()

      if (!localItems.length) {
        setLocalStorageItems(getDefaultPantryItems())
      }

      const items = sortPantryItems(localItems.length ? localItems : getLocalStorageItems())
      logPantryStorage('info', 'Loaded pantry items from localStorage.', {
        backend: 'localStorage' as InventorieStorageBackend,
        count: items.length,
      })

      return items
    }

    try {
      let dexieItems = normalizePantryItems(await db.pantryItems.toArray(), 'dexie')

      if (!dexieItems.length) {
        dexieItems = getDefaultPantryItems()
        await db.pantryItems.bulkPut(dexieItems)
      }

      const items = sortPantryItems(dexieItems)
      logPantryStorage('info', 'Loaded pantry items from Dexie.', {
        backend: 'dexie' as InventorieStorageBackend,
        count: items.length,
      })

      return items
    } catch {
      markInventorieDexieUnavailable()
      logPantryStorage('warning', 'Failed to load from Dexie. Falling back to localStorage.')

      const localItems = getLocalStorageItems()

      if (!localItems.length) {
        setLocalStorageItems(getDefaultPantryItems())
      }

      const items = sortPantryItems(localItems.length ? localItems : getLocalStorageItems())
      logPantryStorage('info', 'Loaded pantry items from localStorage.', {
        backend: 'localStorage' as InventorieStorageBackend,
        count: items.length,
      })

      return items
    }
  } catch (error) {
    logPantryStorage('error', 'Pantry storage load failed. Using empty list.', {
      error: error instanceof Error ? error.message : String(error),
    })

    return []
  }
}

async function addPantryItems(items: PantryItem[]): Promise<void> {
  const db = await getInventorieDatabase()

  if (!db) {
    setLocalStorageItems([...items, ...getLocalStorageItems()])
    logPantryStorage('info', 'Saved pantry items to localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      count: items.length,
    })
    return
  }

  try {
    await db.pantryItems.bulkPut(items)
    logPantryStorage('info', 'Saved pantry items to Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
      count: items.length,
    })
  } catch {
    markInventorieDexieUnavailable()
    setLocalStorageItems([...items, ...getLocalStorageItems()])
    logPantryStorage('warning', 'Failed to save to Dexie. Saved pantry items to localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      count: items.length,
    })
  }
}

async function updatePantryItem(item: PantryItem): Promise<void> {
  const db = await getInventorieDatabase()

  if (!db) {
    updateLocalStorageItem(item)
    logPantryStorage('info', 'Updated pantry item in localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id: item.id,
    })
    return
  }

  try {
    await db.pantryItems.put(item)
    logPantryStorage('info', 'Updated pantry item in Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
      id: item.id,
    })
  } catch {
    markInventorieDexieUnavailable()
    updateLocalStorageItem(item)
    logPantryStorage('warning', 'Failed to update Dexie. Updated pantry item in localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id: item.id,
    })
  }
}

function updateLocalStorageItem(item: PantryItem): void {
  const items = getLocalStorageItems()
  const existingIndex = items.findIndex((existingItem) => existingItem.id === item.id)

  if (existingIndex >= 0) {
    items[existingIndex] = item
  } else {
    items.unshift(item)
  }

  setLocalStorageItems(items)
}

async function deletePantryItem(id: string): Promise<void> {
  const db = await getInventorieDatabase()

  if (!db) {
    setLocalStorageItems(getLocalStorageItems().filter((item) => item.id !== id))
    logPantryStorage('info', 'Deleted pantry item from localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id,
    })
    return
  }

  try {
    await db.pantryItems.delete(id)
    logPantryStorage('info', 'Deleted pantry item from Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
      id,
    })
  } catch {
    markInventorieDexieUnavailable()
    setLocalStorageItems(getLocalStorageItems().filter((item) => item.id !== id))
    logPantryStorage(
      'warning',
      'Failed to delete from Dexie. Deleted pantry item from localStorage.',
      {
        backend: 'localStorage' as InventorieStorageBackend,
        id,
      },
    )
  }
}

async function clearPantryItems(): Promise<void> {
  const db = await getInventorieDatabase()

  if (!db) {
    setLocalStorageItems([])
    logPantryStorage('info', 'Cleared pantry items from localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
    })
    return
  }

  try {
    await db.pantryItems.clear()
    logPantryStorage('info', 'Cleared pantry items from Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
    })
  } catch {
    markInventorieDexieUnavailable()
    setLocalStorageItems([])
    logPantryStorage('warning', 'Failed to clear Dexie. Cleared pantry items from localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
    })
  }
}

export function usePantryStorage() {
  return {
    getPantryItems,
    addPantryItems,
    updatePantryItem,
    deletePantryItem,
    clearPantryItems,
  }
}
