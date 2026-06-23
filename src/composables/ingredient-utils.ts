import type { Ingredient } from '@/composables/app-types'
import { mockIngredients } from '@/mocks/data/mock-ingredients'

export interface IngredientOption {
  title: string
  value: string
  subtitle: string
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getIngredientById(ingredientId: string | null | undefined): Ingredient | null {
  return mockIngredients.find((ingredient) => ingredient.id === ingredientId) ?? null
}

export function findIngredientByName(value: string | null | undefined): Ingredient | null {
  const normalizedValue = normalizeForMatch(String(value ?? ''))

  if (!normalizedValue) {
    return null
  }

  return (
    mockIngredients.find((ingredient) => {
      const terms = [ingredient.name, ...(ingredient.aliases ?? [])].map(normalizeForMatch)

      return terms.some(
        (term) =>
          normalizedValue === term ||
          normalizedValue.includes(term) ||
          term.includes(normalizedValue),
      )
    }) ?? null
  )
}

export function resolveIngredientId(
  ingredientId: string | null | undefined,
  displayName: string | null | undefined,
): string | null {
  if (ingredientId && getIngredientById(ingredientId)) {
    return ingredientId
  }

  return findIngredientByName(displayName)?.id ?? null
}

export const ingredientOptions: IngredientOption[] = mockIngredients.map((ingredient) => ({
  title: ingredient.name,
  value: ingredient.id,
  subtitle: ingredient.category,
}))
