import { defineStore } from 'pinia'
import type { Recipe } from '@/composables/app-types'
import { mockRecipes } from '@/mocks/data/mock-recipes'

export interface RecipeMatch {
  recipe: Recipe
  requiredIngredientIds: string[]
  optionalIngredientIds: string[]
  matchedRequiredIngredientIds: string[]
  missingRequiredIngredientIds: string[]
  matchedOptionalIngredientIds: string[]
  missingOptionalIngredientIds: string[]
  matchScore: number
  canCook: boolean
}

interface RecipesState {
  recipes: Recipe[]
  savedRecipeIds: string[]
}

function normalizeIngredientIds(ingredientIds: Iterable<string | null | undefined>): Set<string> {
  return new Set(
    Array.from(ingredientIds).filter(
      (ingredientId): ingredientId is string =>
        typeof ingredientId === 'string' && Boolean(ingredientId),
    ),
  )
}

function matchRecipe(recipe: Recipe, availableIngredientIds: Set<string>): RecipeMatch {
  const uniqueRecipeIngredientIds = Array.from(new Set(recipe.ingredientIds))
  const uniqueOptionalIngredientIds = Array.from(new Set(recipe.optionalIngredientIds ?? []))
  const requiredIngredientIds = uniqueRecipeIngredientIds.filter(
    (ingredientId) => !uniqueOptionalIngredientIds.includes(ingredientId),
  )
  const optionalIngredientIds = uniqueOptionalIngredientIds.filter((ingredientId) =>
    uniqueRecipeIngredientIds.includes(ingredientId),
  )
  const matchedRequiredIngredientIds = requiredIngredientIds.filter((ingredientId) =>
    availableIngredientIds.has(ingredientId),
  )
  const missingRequiredIngredientIds = requiredIngredientIds.filter(
    (ingredientId) => !availableIngredientIds.has(ingredientId),
  )
  const matchedOptionalIngredientIds = optionalIngredientIds.filter((ingredientId) =>
    availableIngredientIds.has(ingredientId),
  )
  const missingOptionalIngredientIds = optionalIngredientIds.filter(
    (ingredientId) => !availableIngredientIds.has(ingredientId),
  )
  const totalConsideredIngredientIds = requiredIngredientIds.length + optionalIngredientIds.length
  const matchScore = totalConsideredIngredientIds
    ? (matchedRequiredIngredientIds.length + matchedOptionalIngredientIds.length) /
      totalConsideredIngredientIds
    : 0

  return {
    recipe,
    requiredIngredientIds,
    optionalIngredientIds,
    matchedRequiredIngredientIds,
    missingRequiredIngredientIds,
    matchedOptionalIngredientIds,
    missingOptionalIngredientIds,
    matchScore,
    canCook: missingRequiredIngredientIds.length === 0,
  }
}

export const useRecipesStore = defineStore('recipes', {
  state: (): RecipesState => ({
    recipes: mockRecipes,
    savedRecipeIds: mockRecipes
      .filter((recipe) => recipe.savedByDefault)
      .map((recipe) => recipe.id),
  }),
  getters: {
    recipeById: (state) => {
      return (id: string) => state.recipes.find((recipe) => recipe.id === id)
    },
    savedRecipes: (state) => {
      return state.recipes.filter((recipe) => state.savedRecipeIds.includes(recipe.id))
    },
    recipeMatches: (state) => {
      return (ingredientIds: Iterable<string | null | undefined>) => {
        const availableIngredientIds = normalizeIngredientIds(ingredientIds)

        return state.recipes
          .map((recipe) => matchRecipe(recipe, availableIngredientIds))
          .sort((first, second) => {
            const canCookComparison = Number(second.canCook) - Number(first.canCook)

            if (canCookComparison !== 0) {
              return canCookComparison
            }

            const requiredCoverageFirst = first.requiredIngredientIds.length
              ? first.matchedRequiredIngredientIds.length / first.requiredIngredientIds.length
              : 1
            const requiredCoverageSecond = second.requiredIngredientIds.length
              ? second.matchedRequiredIngredientIds.length / second.requiredIngredientIds.length
              : 1
            const requiredCoverageComparison = requiredCoverageSecond - requiredCoverageFirst

            if (requiredCoverageComparison !== 0) {
              return requiredCoverageComparison
            }

            const matchedRequiredComparison =
              second.matchedRequiredIngredientIds.length - first.matchedRequiredIngredientIds.length

            if (matchedRequiredComparison !== 0) {
              return matchedRequiredComparison
            }

            const scoreComparison = second.matchScore - first.matchScore

            if (scoreComparison !== 0) {
              return scoreComparison
            }

            return first.recipe.name.localeCompare(second.recipe.name)
          })
      }
    },
  },
  actions: {
    saveRecipe(recipeId: string) {
      if (!this.savedRecipeIds.includes(recipeId)) {
        this.savedRecipeIds.push(recipeId)
      }
    },
    removeSavedRecipe(recipeId: string) {
      this.savedRecipeIds = this.savedRecipeIds.filter((id) => id !== recipeId)
    },
  },
})
