import { getInventorieDatabase } from '@/composables/useInventorieDatabase'

export const inventorieTestDataLocalStorageKeys = [
  'inventorie:pantry-items',
  'inventorie:scan-records',
] as const

export const inventorieTestDataIndexedDbStores = ['pantryItems', 'scanRecords'] as const

export const inventoriePreservedAuthStorageKeys = [
  'inventorie:auth-users',
  'inventorie:auth-config',
  'inventorie:auth-session',
] as const

export interface InventorieTestDataResetResult {
  localStorageKeysCleared: string[]
  indexedDbStoresCleared: string[]
}

function clearLocalStorageTestData(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  for (const key of inventorieTestDataLocalStorageKeys) {
    window.localStorage.removeItem(key)
  }

  return [...inventorieTestDataLocalStorageKeys]
}

async function clearIndexedDbTestData(): Promise<string[]> {
  const db = await getInventorieDatabase()

  if (!db) {
    return []
  }

  await db.transaction('rw', db.pantryItems, db.scanRecords, async () => {
    await db.pantryItems.clear()
    await db.scanRecords.clear()
  })

  return [...inventorieTestDataIndexedDbStores]
}

export async function resetInventorieTestData(): Promise<InventorieTestDataResetResult> {
  const localStorageKeysCleared = clearLocalStorageTestData()
  const indexedDbStoresCleared = await clearIndexedDbTestData()

  return {
    localStorageKeysCleared,
    indexedDbStoresCleared,
  }
}
