export type FreshnessStatus =
  | 'fresh'
  | 'use-soon'
  | 'expiring-today'
  | 'past-suggested-date'
  | 'unknown'

export type StorageLocation = 'pantry' | 'refrigerator' | 'freezer'

export type PantryItemSource = 'receipt_scan' | 'manual'

export type ScanInputMethod = 'upload' | 'capture' | 'sample'

export type ScanRecordStatus = 'completed' | 'completed_empty' | 'failed' | 'saved'

export type UserRole = 'super_admin' | 'admin' | 'subscriber'

export type AllowedPhoneCountry = 'PH'

export interface AuthUser {
  id: string
  username: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phoneNumber: string | null
  role: UserRole
  isSubscribed: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthAppConfig {
  allowRegistration: boolean
  allowedPhoneCountry: AllowedPhoneCountry
}

export type DebugEventLevel = 'info' | 'success' | 'warning' | 'error'

export interface ScannerDebugEvent {
  id: string
  timestamp: string
  level: DebugEventLevel
  step: string
  message: string
  data?: unknown
}

export interface Ingredient {
  id: string
  name: string
  category: string
  defaultUnit: string
  aliases?: string[]
}

export interface StorageRule {
  id: string
  ingredientId: string
  storageLocation: StorageLocation
  suggestedDays: number
  warningDaysBeforeExpiry?: number
  notes?: string
}

export interface PantryItem {
  id: string
  ingredientId: string | null
  displayName: string
  description: string | null
  quantity: number
  unit: string
  source: PantryItemSource
  purchaseDate: string
  storageLocation: StorageLocation
  estimatedUseByDate: string | null
  freshnessStatus: FreshnessStatus
  addedAt?: string
  scanRecordId?: string | null
  scanCode?: string | null
  scannedAt?: string | null
  scanInputMethod?: ScanInputMethod | null
  originalFileName?: string | null
  rawScanLabel?: string | null
  createdAt: string
  updatedAt: string
}

export interface ScanRecord {
  id: string
  scanCode: string
  alias: string
  note: string | null
  inputMethod: ScanInputMethod
  originalFileName: string | null
  imagePreviewDataUrl?: string | null
  imagePreviewWidth?: number | null
  imagePreviewHeight?: number | null
  imagePreviewByteSize?: number | null
  scannedAt: string
  completedAt: string | null
  itemCount: number
  savedItemCount: number
  ocrConfidence: number
  status: ScanRecordStatus
  createdAt: string
  updatedAt: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  ingredientIds: string[]
  optionalIngredientIds?: string[]
  steps: string[]
  estimatedMinutes: number
  tags: string[]
  offlineAvailable: boolean
  imageIcon?: string
  likes?: number
  ingredientLines?: string[]
  prepSteps?: string[]
  instructions?: string[]
  savedByDefault?: boolean
}

export interface DetectedReceiptItem {
  id: string
  rawLabel: string
  ingredientId: string | null
  displayName: string
  description: string | null
  quantity: number
  unit: string
  storageLocation?: StorageLocation
  estimatedUseByDate?: string | null
  confidence: number
  selected: boolean
}

export interface SampleReceipt {
  id: string
  storeName: string
  purchasedAt: string
  ocrText: string
}
