import Dexie, { type Table } from 'dexie'
import type { PantryItem, ScanRecord } from '@/composables/app-types'

export const inventorieDatabaseName = 'inventorie'

export type InventorieStorageBackend = 'dexie' | 'localStorage'

class InventorieDatabase extends Dexie {
  pantryItems!: Table<PantryItem, string>
  scanRecords!: Table<ScanRecord, string>

  constructor() {
    super(inventorieDatabaseName)

    this.version(1).stores({
      pantryItems: '&id, ingredientId, freshnessStatus, storageLocation, source, updatedAt',
    })

    this.version(2).stores({
      pantryItems:
        '&id, ingredientId, freshnessStatus, storageLocation, source, addedAt, scanRecordId, updatedAt',
      scanRecords: '&id, scanCode, scannedAt, inputMethod, status, updatedAt',
    })
  }
}

let database: InventorieDatabase | null = null
let dexieUnavailable = false

export function logInventorieStorage(
  scope: 'Pantry' | 'Scans',
  level: 'info' | 'warning' | 'error',
  message: string,
  data?: unknown,
): void {
  const consoleMessage = `[Inventorie][${scope}][${level.toUpperCase()}] ${message}`

  if (level === 'error') {
    console.error(consoleMessage, data ?? {})
  } else if (level === 'warning') {
    console.warn(consoleMessage, data ?? {})
  } else {
    console.info(consoleMessage, data ?? {})
  }
}

export async function getInventorieDatabase(): Promise<InventorieDatabase | null> {
  if (dexieUnavailable || typeof window === 'undefined') {
    return null
  }

  try {
    if (!database) {
      database = new InventorieDatabase()
      await database.open()
    }

    return database
  } catch {
    markInventorieDexieUnavailable()
    logInventorieStorage('Pantry', 'warning', 'Dexie is unavailable. Falling back to localStorage.')

    return null
  }
}

export function markInventorieDexieUnavailable(): void {
  dexieUnavailable = true
  database?.close()
  database = null
}
