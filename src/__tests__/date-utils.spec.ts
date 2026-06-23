import { describe, expect, it } from 'vitest'
import {
  addDays,
  calculateUseByDate,
  formatDisplayDate,
  getFreshnessStatus,
} from '@/composables/date-utils'

describe('date-utils', () => {
  it('adds days and calculates use-by dates', () => {
    const purchaseDate = '2026-06-18T00:00:00.000Z'

    expect(addDays(purchaseDate, 3)).toBe('2026-06-21T00:00:00.000Z')
    expect(calculateUseByDate(purchaseDate, 7)).toBe('2026-06-25T00:00:00.000Z')
  })

  it('formats dates for display', () => {
    expect(formatDisplayDate('2026-06-18T00:00:00.000Z')).toMatch(/2026/)
  })

  it('returns unknown when no date is available', () => {
    expect(getFreshnessStatus(null, 2, new Date('2026-06-18T00:00:00.000Z'))).toBe('unknown')
  })

  it('returns past suggested date for dates before today', () => {
    expect(
      getFreshnessStatus(
        '2026-06-17T00:00:00.000Z',
        2,
        new Date('2026-06-18T00:00:00.000Z'),
      ),
    ).toBe('past-suggested-date')
  })

  it('returns expiring today for the current date', () => {
    expect(
      getFreshnessStatus(
        '2026-06-18T00:00:00.000Z',
        2,
        new Date('2026-06-18T00:00:00.000Z'),
      ),
    ).toBe('expiring-today')
  })

  it('returns use soon within the warning window', () => {
    expect(
      getFreshnessStatus(
        '2026-06-20T00:00:00.000Z',
        2,
        new Date('2026-06-18T00:00:00.000Z'),
      ),
    ).toBe('use-soon')
  })

  it('returns fresh beyond the warning window', () => {
    expect(
      getFreshnessStatus(
        '2026-06-24T00:00:00.000Z',
        2,
        new Date('2026-06-18T00:00:00.000Z'),
      ),
    ).toBe('fresh')
  })
})
