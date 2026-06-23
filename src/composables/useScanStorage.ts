import type { ScanRecord } from '@/composables/app-types'
import { normalizeScanRecord, sortScanRecords } from '@/composables/scan-record-utils'
import {
  getInventorieDatabase,
  logInventorieStorage,
  markInventorieDexieUnavailable,
  type InventorieStorageBackend,
} from '@/composables/useInventorieDatabase'

const localStorageKey = 'inventorie:scan-records'

function logScanStorage(
  level: 'info' | 'warning' | 'error',
  message: string,
  data?: unknown,
): void {
  logInventorieStorage('Scans', level, message, data)
}

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function normalizeScanRecords(value: unknown, source: InventorieStorageBackend): ScanRecord[] {
  if (!Array.isArray(value)) {
    logScanStorage('warning', `Scan records from ${source} were not an array. Using empty list.`, {
      backend: source,
    })

    return []
  }

  return sortScanRecords(value.flatMap((record, index) => normalizeScanRecord(record, index) ?? []))
}

function getLocalStorageScanRecords(): ScanRecord[] {
  if (!canUseBrowserStorage()) {
    return []
  }

  try {
    const rawRecords = window.localStorage.getItem(localStorageKey)

    if (!rawRecords) {
      return []
    }

    const parsedRecords = JSON.parse(rawRecords)

    if (!Array.isArray(parsedRecords)) {
      window.localStorage.removeItem(localStorageKey)
      logScanStorage('warning', 'Malformed localStorage scan records were cleared.', {
        backend: 'localStorage' as InventorieStorageBackend,
      })

      return []
    }

    return normalizeScanRecords(parsedRecords, 'localStorage')
  } catch {
    window.localStorage.removeItem(localStorageKey)
    logScanStorage('warning', 'Invalid localStorage scan records were cleared.', {
      backend: 'localStorage' as InventorieStorageBackend,
    })

    return []
  }
}

function setLocalStorageScanRecords(records: ScanRecord[]): void {
  if (!canUseBrowserStorage()) {
    return
  }

  window.localStorage.setItem(
    localStorageKey,
    JSON.stringify(normalizeScanRecords(records, 'localStorage')),
  )
}

async function getScanRecords(): Promise<ScanRecord[]> {
  try {
    const db = await getInventorieDatabase()

    if (!db) {
      const records = getLocalStorageScanRecords()
      logScanStorage('info', 'Loaded scan records from localStorage.', {
        backend: 'localStorage' as InventorieStorageBackend,
        count: records.length,
      })

      return records
    }

    try {
      const records = normalizeScanRecords(await db.scanRecords.toArray(), 'dexie')
      logScanStorage('info', 'Loaded scan records from Dexie.', {
        backend: 'dexie' as InventorieStorageBackend,
        count: records.length,
      })

      return records
    } catch {
      markInventorieDexieUnavailable()
      logScanStorage('warning', 'Failed to load from Dexie. Falling back to localStorage.')

      const records = getLocalStorageScanRecords()
      logScanStorage('info', 'Loaded scan records from localStorage.', {
        backend: 'localStorage' as InventorieStorageBackend,
        count: records.length,
      })

      return records
    }
  } catch (error) {
    logScanStorage('error', 'Scan storage load failed. Using empty list.', {
      error: error instanceof Error ? error.message : String(error),
    })

    return []
  }
}

async function saveScanRecord(record: ScanRecord): Promise<void> {
  const normalizedRecord = normalizeScanRecord(record)

  if (!normalizedRecord) {
    return
  }

  const db = await getInventorieDatabase()

  if (!db) {
    updateLocalStorageScanRecord(normalizedRecord)
    logScanStorage('info', 'Saved scan record to localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id: normalizedRecord.id,
    })
    return
  }

  try {
    await db.scanRecords.put(normalizedRecord)
    logScanStorage('info', 'Saved scan record to Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
      id: normalizedRecord.id,
    })
  } catch {
    markInventorieDexieUnavailable()
    updateLocalStorageScanRecord(normalizedRecord)
    logScanStorage('warning', 'Failed to save to Dexie. Saved scan record to localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id: normalizedRecord.id,
    })
  }
}

function updateLocalStorageScanRecord(record: ScanRecord): void {
  const records = getLocalStorageScanRecords()
  const existingIndex = records.findIndex((existingRecord) => existingRecord.id === record.id)

  if (existingIndex >= 0) {
    records[existingIndex] = record
  } else {
    records.unshift(record)
  }

  setLocalStorageScanRecords(records)
}

async function deleteScanRecord(id: string): Promise<void> {
  const db = await getInventorieDatabase()

  if (!db) {
    setLocalStorageScanRecords(getLocalStorageScanRecords().filter((record) => record.id !== id))
    logScanStorage('info', 'Deleted scan record from localStorage.', {
      backend: 'localStorage' as InventorieStorageBackend,
      id,
    })
    return
  }

  try {
    await db.scanRecords.delete(id)
    logScanStorage('info', 'Deleted scan record from Dexie.', {
      backend: 'dexie' as InventorieStorageBackend,
      id,
    })
  } catch {
    markInventorieDexieUnavailable()
    setLocalStorageScanRecords(getLocalStorageScanRecords().filter((record) => record.id !== id))
    logScanStorage(
      'warning',
      'Failed to delete from Dexie. Deleted scan record from localStorage.',
      {
        backend: 'localStorage' as InventorieStorageBackend,
        id,
      },
    )
  }
}

export function useScanStorage() {
  return {
    getScanRecords,
    saveScanRecord,
    deleteScanRecord,
  }
}
