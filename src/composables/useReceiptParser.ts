import type { DetectedReceiptItem, Ingredient } from '@/composables/app-types'
import { mockIngredients } from '@/mocks/data/mock-ingredients'

const metadataWords = [
  'subtotal',
  'total',
  'tax',
  'vat',
  'cash',
  'card',
  'change',
  'payment',
  'invoice',
  'receipt',
  'official',
  'approval',
  'reference',
  'transaction',
  'date',
  'time',
  'cashier',
  'store',
  'branch',
  'grocery',
  'market',
  'mart',
  'supermarket',
  'inventorie',
  'scan',
  'test',
  'image',
  'thank',
  'shopping',
]

const unitAliases: Record<string, string> = {
  kilo: 'kg',
  kilos: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  kg: 'kg',
  g: 'g',
  gram: 'g',
  grams: 'g',
  l: 'liter',
  liter: 'liter',
  liters: 'liter',
  litre: 'liter',
  ml: 'ml',
  pc: 'piece',
  pcs: 'piece',
  piece: 'piece',
  pieces: 'piece',
  ct: 'count',
  count: 'count',
  dozen: 'dozen',
  doz: 'dozen',
  pack: 'pack',
  packs: 'pack',
  bag: 'bag',
  bags: 'bag',
  box: 'box',
  boxes: 'box',
  can: 'can',
  cans: 'can',
  bottle: 'bottle',
  bottles: 'bottle',
  loaf: 'loaf',
  bundle: 'bundle',
  head: 'head',
  cup: 'cup',
}

interface ParsedQuantity {
  quantity: number
  unit: string | null
  label: string
  hasPrice: boolean
}

interface IngredientTerm {
  ingredient: Ingredient
  normalizedTerm: string
}

const ingredientTerms = mockIngredients
  .flatMap((ingredient) => {
    const terms = [ingredient.name, ...(ingredient.aliases ?? [])]

    return terms.map((term) => ({
      ingredient,
      normalizedTerm: normalizeForMatch(term),
    }))
  })
  .sort((first, second) => second.normalizedTerm.length - first.normalizedTerm.length)

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[0o]/g, 'o')
    .replace(/[1i]/g, 'i')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function makeDetectedItemId(index: number, label: string): string {
  const slug = normalizeForMatch(label).replace(/\s+/g, '-').slice(0, 32) || 'item'

  return `detected-${index + 1}-${slug}`
}

function hasReceiptMetadata(line: string): boolean {
  const normalized = normalizeForMatch(line)

  return metadataWords.some((word) => normalized.includes(word))
}

function isMostlyNumeric(line: string): boolean {
  const normalizedLine = normalizeForMatch(line)
  const letters = normalizedLine.match(/[a-z]/g)?.length ?? 0
  const digits = line.match(/\d/g)?.length ?? 0

  return letters < 3 || digits > letters * 2.5
}

function hasPriceLikeAmount(line: string): boolean {
  return /\b\d+[.,][\doO]{2}\b/i.test(line)
}

function normalizeUnit(unit: string): string {
  return unitAliases[unit.toLowerCase()] ?? unit.toLowerCase()
}

function normalizeOcrWordCharacters(value: string): string {
  return value.replace(/\b[\w]*[01][\w]*\b/g, (word) => {
    if (!/[A-Za-z]/.test(word)) {
      return word
    }

    return word.replace(/0/g, 'O').replace(/1/g, 'I')
  })
}

function extractQuantity(line: string): ParsedQuantity {
  let workingLine = line
  let quantity = 1
  let unit: string | null = null
  const hasPrice = hasPriceLikeAmount(line)

  const quantityWithUnitMatch = workingLine.match(
    /\b(\d+(?:[.,]\d+)?)\s*(kg|kilo|kilos|kilogram|kilograms|g|gram|grams|l|liter|liters|litre|ml|pc|pcs|piece|pieces|ct|count|dozen|doz|pack|packs|bag|bags|box|boxes|can|cans|bottle|bottles|loaf|bundle|head|cup)\b/i,
  )

  if (quantityWithUnitMatch?.[1] && quantityWithUnitMatch[2]) {
    quantity = Number(quantityWithUnitMatch[1].replace(',', '.')) || 1
    unit = normalizeUnit(quantityWithUnitMatch[2])
    workingLine = workingLine.replace(quantityWithUnitMatch[0], ' ')
  } else {
    const simpleQuantityMatch = workingLine.match(/\b(?:qty|quantity|x)\s*(\d+(?:[.,]\d+)?)\b/i)

    if (simpleQuantityMatch?.[1]) {
      quantity = Number(simpleQuantityMatch[1].replace(',', '.')) || 1
      workingLine = workingLine.replace(simpleQuantityMatch[0], ' ')
    }
  }

  return {
    quantity,
    unit,
    label: workingLine,
    hasPrice,
  }
}

function cleanReceiptLine(line: string): ParsedQuantity | null {
  if (!line.trim() || hasReceiptMetadata(line) || isMostlyNumeric(line)) {
    return null
  }

  const quantityResult = extractQuantity(line)
  const cleanedLabel = quantityResult.label
    .replace(/[₱$]/g, ' ')
    .replace(/\bphp\b/gi, ' ')
    .replace(/\b\d+[.,][\doO]{2}\b/g, ' ')
    .replace(/\bp\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const normalizedLabel = normalizeOcrWordCharacters(cleanedLabel)
    .replace(/\b\d+\b/g, ' ')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalizedLabel || hasReceiptMetadata(normalizedLabel) || isMostlyNumeric(normalizedLabel)) {
    return null
  }

  return {
    ...quantityResult,
    label: normalizedLabel,
  }
}

function findIngredient(label: string): IngredientTerm | null {
  const normalizedLabel = normalizeForMatch(label)

  return (
    ingredientTerms.find(({ normalizedTerm }) => {
      if (!normalizedTerm) {
        return false
      }

      return (
        normalizedLabel === normalizedTerm ||
        normalizedLabel.includes(normalizedTerm) ||
        normalizedTerm.includes(normalizedLabel)
      )
    }) ?? null
  )
}

function tokenMatches(value: string, target: string): boolean {
  return value === target || value === `${target}s` || (target.endsWith('s') && value === target.slice(0, -1))
}

function getItemDescription(label: string, ingredient: Ingredient, matchedTerm: IngredientTerm): string | null {
  const labelTokens = normalizeForMatch(label).split(' ').filter(Boolean)
  const ingredientTokens = normalizeForMatch(ingredient.name).split(' ').filter(Boolean)
  const matchedTokens = matchedTerm.normalizedTerm.split(' ').filter(Boolean)
  const removeTokens = new Set(ingredientTokens)

  if (
    matchedTokens.length === 1 &&
    !ingredientTokens.some((ingredientToken) => tokenMatches(matchedTokens[0] ?? '', ingredientToken))
  ) {
    removeTokens.add(matchedTokens[0] ?? '')
  }

  const descriptionTokens = labelTokens.filter(
    (token) => !Array.from(removeTokens).some((removeToken) => tokenMatches(token, removeToken)),
  )
  const description = titleCase(descriptionTokens.join(' '))

  return description && description !== ingredient.name ? description : null
}

function shouldKeepUnknownItem(cleaned: ParsedQuantity): boolean {
  const normalizedLabel = normalizeForMatch(cleaned.label)
  const wordCount = normalizedLabel.split(' ').filter(Boolean).length

  return Boolean(cleaned.unit && cleaned.hasPrice && wordCount >= 2)
}

export function parseReceiptText(ocrText: string): DetectedReceiptItem[] {
  return ocrText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((rawLabel, index) => {
      const cleaned = cleanReceiptLine(rawLabel)

      if (!cleaned) {
        return null
      }

      const matchedIngredient = findIngredient(cleaned.label)
      const ingredient = matchedIngredient?.ingredient ?? null

      if (!ingredient && !shouldKeepUnknownItem(cleaned)) {
        return null
      }

      return {
        id: makeDetectedItemId(index, cleaned.label),
        rawLabel,
        ingredientId: ingredient?.id ?? null,
        displayName: ingredient?.name ?? titleCase(cleaned.label),
        description: ingredient && matchedIngredient
          ? getItemDescription(cleaned.label, ingredient, matchedIngredient)
          : null,
        quantity: cleaned.quantity,
        unit: cleaned.unit ?? ingredient?.defaultUnit ?? 'item',
        confidence: ingredient ? 0.88 : 0.46,
        selected: true,
      }
    })
    .filter((item): item is DetectedReceiptItem => Boolean(item))
}

function titleCase(value: string): string {
  return normalizeForMatch(value)
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

export function useReceiptParser() {
  return {
    parseReceiptText,
  }
}
