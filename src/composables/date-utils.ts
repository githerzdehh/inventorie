import type { FreshnessStatus } from './app-types'

const millisecondsPerDay = 24 * 60 * 60 * 1000

export function addDays(dateInput: string | Date, days: number): string {
  const date = new Date(dateInput)
  date.setDate(date.getDate() + days)

  return date.toISOString()
}

export function daysUntil(dateInput: string | Date, today: Date = new Date()): number {
  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return Number.NaN
  }

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  return Math.ceil((targetDate.getTime() - startOfToday.getTime()) / millisecondsPerDay)
}

export function calculateUseByDate(
  purchaseDate: string | Date,
  maxDays?: number | null,
): string | null {
  if (typeof maxDays !== 'number' || Number.isNaN(maxDays) || maxDays < 0) {
    return null
  }

  return addDays(purchaseDate, maxDays)
}

export function getFreshnessStatus(
  useByDate?: string | Date | null,
  warningDaysBeforeExpiry = 2,
  today: Date = new Date(),
): FreshnessStatus {
  if (!useByDate) {
    return 'unknown'
  }

  const remainingDays = daysUntil(useByDate, today)

  if (Number.isNaN(remainingDays)) {
    return 'unknown'
  }

  if (remainingDays < 0) {
    return 'past-suggested-date'
  }

  if (remainingDays === 0) {
    return 'expiring-today'
  }

  if (remainingDays <= warningDaysBeforeExpiry) {
    return 'use-soon'
  }

  return 'fresh'
}

export function formatDisplayDate(dateInput: string | Date): string {
  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatShortDate(dateInput: string | Date): string {
  return formatDisplayDate(dateInput)
}

export function formatDisplayDateTime(dateInput: string | Date): string {
  const date = new Date(dateInput)

  if (Number.isNaN(date.getTime())) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}
