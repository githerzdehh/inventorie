export interface QuantityUnitOption {
  title: string
  value: string
  allowsDecimal: boolean
}

const decimalQuantityUnits = new Set([
  'mg',
  'g',
  'gram',
  'grams',
  'kg',
  'oz',
  'ounce',
  'ounces',
  'lb',
  'lbs',
  'ml',
  'l',
  'liter',
  'liters',
  'litre',
  'fl oz',
])

const integerQuantityUnits = new Set([
  'item',
  'piece',
  'pieces',
  'count',
  'pack',
  'bag',
  'box',
  'can',
  'bottle',
  'loaf',
  'bundle',
  'head',
  'dozen',
  'cup',
])

export const quantityUnitOptions: QuantityUnitOption[] = [
  { title: 'Item', value: 'item', allowsDecimal: false },
  { title: 'Piece', value: 'piece', allowsDecimal: false },
  { title: 'Count', value: 'count', allowsDecimal: false },
  { title: 'Pack', value: 'pack', allowsDecimal: false },
  { title: 'Bag', value: 'bag', allowsDecimal: false },
  { title: 'Box', value: 'box', allowsDecimal: false },
  { title: 'Can', value: 'can', allowsDecimal: false },
  { title: 'Bottle', value: 'bottle', allowsDecimal: false },
  { title: 'Loaf', value: 'loaf', allowsDecimal: false },
  { title: 'Bundle', value: 'bundle', allowsDecimal: false },
  { title: 'Head', value: 'head', allowsDecimal: false },
  { title: 'Dozen', value: 'dozen', allowsDecimal: false },
  { title: 'Cup', value: 'cup', allowsDecimal: false },
  { title: 'Milligram (mg)', value: 'mg', allowsDecimal: true },
  { title: 'Gram (g)', value: 'g', allowsDecimal: true },
  { title: 'Kilogram (kg)', value: 'kg', allowsDecimal: true },
  { title: 'Ounce (oz)', value: 'oz', allowsDecimal: true },
  { title: 'Pound (lb)', value: 'lb', allowsDecimal: true },
  { title: 'Milliliter (ml)', value: 'ml', allowsDecimal: true },
  { title: 'Liter', value: 'liter', allowsDecimal: true },
  { title: 'Fluid ounce (fl oz)', value: 'fl oz', allowsDecimal: true },
]

export interface QuantityValidationResult {
  quantity: number | null
  errorMessage: string | null
}

export function normalizeQuantityUnit(unit: unknown): string {
  return typeof unit === 'string' && unit.trim() ? unit.trim().toLowerCase() : 'item'
}

export function quantityUnitAllowsDecimal(unit: unknown): boolean {
  const normalizedUnit = normalizeQuantityUnit(unit)

  if (decimalQuantityUnits.has(normalizedUnit)) {
    return true
  }

  if (integerQuantityUnits.has(normalizedUnit)) {
    return false
  }

  return false
}

export function getQuantityInputMode(unit: unknown): 'decimal' | 'numeric' {
  return quantityUnitAllowsDecimal(unit) ? 'decimal' : 'numeric'
}

export function formatQuantity(quantity: unknown): string {
  return typeof quantity === 'number' && Number.isFinite(quantity) ? String(quantity) : '1'
}

export function validateQuantityInput(value: unknown, unit: unknown): QuantityValidationResult {
  const rawValue = String(value ?? '').trim()
  const normalizedUnit = normalizeQuantityUnit(unit)
  const allowsDecimal = quantityUnitAllowsDecimal(normalizedUnit)
  const pattern = allowsDecimal ? /^\d+(?:[.,]\d+)?$/ : /^\d+$/

  if (!rawValue) {
    return {
      quantity: null,
      errorMessage: 'Quantity is required.',
    }
  }

  if (!pattern.test(rawValue)) {
    return {
      quantity: null,
      errorMessage: allowsDecimal
        ? 'Quantity must be a positive number.'
        : 'Quantity must be a whole number for this unit.',
    }
  }

  const quantity = Number(rawValue.replace(',', '.'))

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return {
      quantity: null,
      errorMessage: 'Quantity must be greater than zero.',
    }
  }

  if (!allowsDecimal && !Number.isInteger(quantity)) {
    return {
      quantity: null,
      errorMessage: 'Quantity must be a whole number for this unit.',
    }
  }

  return {
    quantity,
    errorMessage: null,
  }
}

export function isValidQuantityInput(value: unknown, unit: unknown): boolean {
  return !validateQuantityInput(value, unit).errorMessage
}
