import type { Recipe } from '@/composables/app-types'

export const mockRecipes = [
  {
    id: 'recipe-spinach-eggs',
    name: 'Spinach Egg Skillet',
    description: 'A quick stovetop meal that uses eggs and greens before they wilt.',
    ingredientIds: ['ingredient-eggs', 'ingredient-spinach', 'ingredient-tomatoes'],
    steps: ['Warm a skillet.', 'Add spinach and tomatoes.', 'Crack in eggs and cook until set.'],
    estimatedMinutes: 15,
    tags: ['breakfast', 'quick'],
    offlineAvailable: true,
  },
  {
    id: 'recipe-tomato-pasta',
    name: 'Simple Tomato Pasta',
    description: 'A pantry-friendly dinner built from pasta and fresh tomatoes.',
    ingredientIds: ['ingredient-pasta', 'ingredient-tomatoes'],
    steps: ['Boil pasta.', 'Cook chopped tomatoes in a pan.', 'Toss pasta with the sauce.'],
    estimatedMinutes: 25,
    tags: ['dinner', 'pantry'],
    offlineAvailable: true,
  },
] satisfies Recipe[]
