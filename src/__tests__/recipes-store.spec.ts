import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useRecipesStore } from '@/stores/recipes'

describe('recipes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('treats missing optional ingredients as cookable', () => {
    const recipesStore = useRecipesStore()

    const matches = recipesStore.recipeMatches([
      'ingredient-rice',
      'ingredient-chicken',
      'ingredient-ginger',
      'ingredient-garlic',
      'ingredient-onion',
      'ingredient-pechay',
    ])

    const tinola = matches.find((match) => match.recipe.id === 'recipe-chicken-tinola-bowl')

    expect(tinola?.canCook).toBe(true)
    expect(tinola?.missingRequiredIngredientIds).toEqual([])
    expect(tinola?.missingOptionalIngredientIds).toEqual(['ingredient-scallions'])
  })

  it('keeps missing required ingredients in the almost-ready bucket', () => {
    const recipesStore = useRecipesStore()

    const matches = recipesStore.recipeMatches([
      'ingredient-rice',
      'ingredient-chicken',
      'ingredient-ginger',
      'ingredient-onion',
      'ingredient-scallions',
    ])

    const tinola = matches.find((match) => match.recipe.id === 'recipe-chicken-tinola-bowl')

    expect(tinola?.canCook).toBe(false)
    expect(tinola?.missingRequiredIngredientIds).toEqual(['ingredient-pechay'])
    expect(tinola?.matchedRequiredIngredientIds).toEqual([
      'ingredient-chicken',
      'ingredient-ginger',
      'ingredient-onion',
      'ingredient-rice',
    ])
  })

  it('ranks full required matches ahead of partial matches', () => {
    const recipesStore = useRecipesStore()

    const matches = recipesStore.recipeMatches([
      'ingredient-rice',
      'ingredient-chicken',
      'ingredient-ginger',
      'ingredient-onion',
      'ingredient-pechay',
      'ingredient-scallions',
      'ingredient-garlic',
    ])

    expect(matches[0]?.recipe.id).toBe('recipe-chicken-tinola-bowl')
    expect(matches[0]?.canCook).toBe(true)
    expect(matches.some((match) => match.recipe.id === 'recipe-arroz-caldo')).toBe(true)
  })
})
