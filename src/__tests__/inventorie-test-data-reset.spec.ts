import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetInventorieTestData } from '@/composables/useInventorieTestDataReset'

const databaseMock = vi.hoisted(() => ({
  pantryItems: {
    clear: vi.fn(),
  },
  scanRecords: {
    clear: vi.fn(),
  },
  transaction: vi.fn(
    async (
      _mode: string,
      _pantryItems: unknown,
      _scanRecords: unknown,
      task: () => Promise<void> | void,
    ) => {
      await task()
    },
  ),
}))

const getInventorieDatabaseMock = vi.hoisted(() => vi.fn())

vi.mock('@/composables/useInventorieDatabase', () => ({
  getInventorieDatabase: getInventorieDatabaseMock,
}))

describe('Inventorie test data reset', () => {
  beforeEach(() => {
    window.localStorage.clear()
    databaseMock.pantryItems.clear.mockReset()
    databaseMock.scanRecords.clear.mockReset()
    databaseMock.transaction.mockClear()
    getInventorieDatabaseMock.mockReset()
    getInventorieDatabaseMock.mockResolvedValue(databaseMock)
  })

  it('clears pantry and scan storage while preserving auth storage', async () => {
    window.localStorage.setItem('inventorie:pantry-items', '[{"id":"pantry-1"}]')
    window.localStorage.setItem('inventorie:scan-records', '[{"id":"scan-1"}]')
    window.localStorage.setItem('inventorie:auth-users', '[{"id":"super-admin"}]')
    window.localStorage.setItem('inventorie:auth-config', '{"allowRegistration":false}')
    window.localStorage.setItem('inventorie:auth-session', '{"id":"super-admin"}')

    const result = await resetInventorieTestData()

    expect(window.localStorage.getItem('inventorie:pantry-items')).toBeNull()
    expect(window.localStorage.getItem('inventorie:scan-records')).toBeNull()
    expect(window.localStorage.getItem('inventorie:auth-users')).toBe('[{"id":"super-admin"}]')
    expect(window.localStorage.getItem('inventorie:auth-config')).toBe(
      '{"allowRegistration":false}',
    )
    expect(window.localStorage.getItem('inventorie:auth-session')).toBe(
      '{"id":"super-admin"}',
    )
    expect(databaseMock.pantryItems.clear).toHaveBeenCalledOnce()
    expect(databaseMock.scanRecords.clear).toHaveBeenCalledOnce()
    expect(result).toEqual({
      localStorageKeysCleared: ['inventorie:pantry-items', 'inventorie:scan-records'],
      indexedDbStoresCleared: ['pantryItems', 'scanRecords'],
    })
  })

  it('still clears localStorage when IndexedDB is unavailable', async () => {
    getInventorieDatabaseMock.mockResolvedValue(null)
    window.localStorage.setItem('inventorie:pantry-items', '[{"id":"pantry-1"}]')
    window.localStorage.setItem('inventorie:scan-records', '[{"id":"scan-1"}]')

    const result = await resetInventorieTestData()

    expect(window.localStorage.getItem('inventorie:pantry-items')).toBeNull()
    expect(window.localStorage.getItem('inventorie:scan-records')).toBeNull()
    expect(databaseMock.pantryItems.clear).not.toHaveBeenCalled()
    expect(databaseMock.scanRecords.clear).not.toHaveBeenCalled()
    expect(result.indexedDbStoresCleared).toEqual([])
  })
})
