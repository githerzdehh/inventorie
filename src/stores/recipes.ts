import { defineStore } from 'pinia'
import type { Recipe } from '@/composables/app-types'
import { mockRecipes } from '@/mocks/data/mock-recipes'

interface RecipesState {
  recipes: Recipe[]
  savedRecipeIds: string[]
}

export const useRecipesStore = defineStore('recipes', {
  state: (): RecipesState => ({
    recipes: mockRecipes,
    savedRecipeIds: ['recipe-spinach-eggs'],
  }),
  getters: {
    recipeById: (state) => {
      return (id: string) => state.recipes.find((recipe) => recipe.id === id)
    },
    savedRecipes: (state) => {
      return state.recipes.filter((recipe) => state.savedRecipeIds.includes(recipe.id))
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
