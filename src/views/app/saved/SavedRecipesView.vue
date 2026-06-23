<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import EmptyState from '@/components/common/empty-state.vue'
import { useRecipesStore } from '@/stores/recipes'

const recipesStore = useRecipesStore()
</script>

<template>
  <section class="saved-recipes-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Saved recipes</h2>
      <p>Recipe ideas kept for quick offline access.</p>
    </div>

    <v-row v-if="recipesStore.savedRecipes.length">
      <v-col v-for="recipe in recipesStore.savedRecipes" :key="recipe.id" cols="12" md="6">
        <app-card :title="recipe.name" :subtitle="recipe.description" icon="mdi-bookmark-outline">
          <template #actions>
            <app-button
              :to="`/app/recipes/${recipe.id}`"
              variant="tonal"
              icon="mdi-book-open-page-variant-outline"
            >
              Open
            </app-button>
          </template>
        </app-card>
      </v-col>
    </v-row>

    <empty-state
      v-else
      icon="mdi-bookmark-outline"
      title="No saved recipes"
      description="Save a suggested recipe to keep it available here."
      action-label="Find recipes"
      action-to="/app/cook"
    />
  </section>
</template>
