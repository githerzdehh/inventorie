import type { ScanInputMethod, ScanRecord, ScanRecordStatus } from '@/composables/app-types'

const validInputMethods = new Set<ScanInputMethod>(['upload', 'capture', 'sample'])
const validStatuses = new Set<ScanRecordStatus>(['completed', 'completed_empty', 'failed', 'saved'])

function makeRandomSuffix(): string {
  if (globalThis.crypto?.getRandomValues) {
    const values = new Uint8Array(2)
    globalThis.crypto.getRandomValues(values)

    return Array.from(values)
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  }

  return Math.random().toString(16).slice(2, 6).toUpperCase().padEnd(4, '0')
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function makeScanRecordId(index = 0): string {
  if (globalThis.crypto?.randomUUID) {
    return `scan-${globalThis.crypto.randomUUID()}`
  }

  return `scan-${Date.now()}-${index}`
}

export function makeScanCode(scannedAt: string | Date = new Date()): string {
  const date = new Date(scannedAt)
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date
  const stamp = [
    safeDate.getFullYear(),
    pad(safeDate.getMonth() + 1),
    pad(safeDate.getDate()),
    '-',
    pad(safeDate.getHours()),
    pad(safeDate.getMinutes()),
    pad(safeDate.getSeconds()),
  ].join('')

  return `CVSCAN-${stamp}-${makeRandomSuffix()}`
}

export function makeDefaultScanAlias(inputMethod: ScanInputMethod, scannedAt: string): string {
  const labelByMethod: Record<ScanInputMethod, string> = {
    upload: 'Uploaded source image',
    capture: 'Captured source image',
    sample: 'Sample scan',
  }
  const date = new Date(scannedAt)
  const dateLabel = Number.isNaN(date.getTime())
    ? 'recent scan'
    : new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date)

  return `${labelByMethod[inputMethod]} · ${dateLabel}`
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeInputMethod(value: unknown): ScanInputMethod {
  return typeof value === 'string' && validInputMethods.has(value as ScanInputMethod)
    ? (value as ScanInputMethod)
    : 'upload'
}

function normalizeStatus(value: unknown): ScanRecordStatus {
  return typeof value === 'string' && validStatuses.has(value as ScanRecordStatus)
    ? (value as ScanRecordStatus)
    : 'completed'
}

function normalizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

function normalizeNullableCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : null
}

function normalizeConfidence(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0
}

export function normalizeScanRecord(record: unknown, index = 0): ScanRecord | null {
  if (!record || typeof record !== 'object') {
    return null
  }

  const input = record as Partial<ScanRecord>
  const now = new Date().toISOString()
  const scannedAt = normalizeString(input.scannedAt, normalizeString(input.createdAt, now))
  const inputMethod = normalizeInputMethod(input.inputMethod)

  return {
    id: normalizeString(input.id, makeScanRecordId(index)),
    scanCode: normalizeString(input.scanCode, makeScanCode(scannedAt)),
    alias: normalizeString(input.alias, makeDefaultScanAlias(inputMethod, scannedAt)),
    note: normalizeNullableString(input.note),
    inputMethod,
    originalFileName: normalizeNullableString(input.originalFileName),
    imagePreviewDataUrl: normalizeNullableString(input.imagePreviewDataUrl),
    imagePreviewWidth: normalizeNullableCount(input.imagePreviewWidth),
    imagePreviewHeight: normalizeNullableCount(input.imagePreviewHeight),
    imagePreviewByteSize: normalizeNullableCount(input.imagePreviewByteSize),
    scannedAt,
    completedAt: normalizeNullableString(input.completedAt),
    itemCount: normalizeCount(input.itemCount),
    savedItemCount: normalizeCount(input.savedItemCount),
    ocrConfidence: normalizeConfidence(input.ocrConfidence),
    status: normalizeStatus(input.status),
    createdAt: normalizeString(input.createdAt, scannedAt),
    updatedAt: normalizeString(input.updatedAt, normalizeString(input.createdAt, scannedAt)),
  }
}

export function sortScanRecords(records: ScanRecord[]): ScanRecord[] {
  return [...records].sort((first, second) =>
    String(second.scannedAt).localeCompare(String(first.scannedAt)),
  )
}

export function scanInputMethodLabel(inputMethod: ScanInputMethod | null | undefined): string {
  if (inputMethod === 'capture') {
    return 'Capture image'
  }

  if (inputMethod === 'sample') {
    return 'Sample scan'
  }

  return 'Upload image'
}

export function scanRecordStatusLabel(status: ScanRecordStatus | null | undefined): string {
  if (status === 'completed_empty') {
    return 'No items found'
  }

  if (status === 'failed') {
    return 'Failed'
  }

  if (status === 'saved') {
    return 'Saved to pantry'
  }

  return 'Ready for review'
}
