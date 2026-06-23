<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import { useRecipesStore } from '@/stores/recipes'

const recipesStore = useRecipesStore()
</script>

<template>
  <section class="saved-recipes-view app-page app-mobile-shell">
    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/cook" variant="tonal">Back</app-button>
    <h1>SAVED RECIPES</h1>

    <div v-if="recipesStore.savedRecipes.length" class="saved-recipes-view__list">
      <router-link
        v-for="recipe in recipesStore.savedRecipes"
        :key="recipe.id"
        class="saved-recipes-view__row"
        :to="`/app/recipes/${recipe.id}`"
      >
        <span class="saved-recipes-view__icon">{{ recipe.imageIcon ?? '🍽️' }}</span>
        <span>
          <strong>{{ recipe.name }}</strong>
          <small>
            <v-icon icon="mdi-thumb-up-outline" size="small" />
            {{ recipe.likes ?? 0 }}
            <v-icon icon="mdi-clock-outline" size="small" />
            {{ recipe.estimatedMinutes - 5 }}-{{ recipe.estimatedMinutes }} mins
          </small>
        </span>
        <v-icon icon="mdi-bookmark-outline" />
      </router-link>
    </div>

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

<style scoped>
.saved-recipes-view {
  display: grid;
  gap: var(--space-4);
  padding: calc(var(--space-4) + var(--safe-area-top)) var(--space-4) var(--space-10);
}

.saved-recipes-view h1 {
  margin: var(--space-4) 0 var(--space-2);
  color: var(--color-primary);
  font-family: var(--font-family-title);
  font-size: clamp(2rem, 10vw, 3rem);
  line-height: 1;
  text-shadow: 0.16em 0.08em 0 rgba(248, 166, 13, 0.75);
}

.saved-recipes-view__list {
  display: grid;
  gap: var(--space-3);
}

.saved-recipes-view__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) var(--space-4);
  color: var(--color-primary);
  background: var(--color-secondary-soft);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-xl);
}

.saved-recipes-view__icon {
  display: grid;
  width: 3.8rem;
  height: 3.8rem;
  place-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  font-size: 2.4rem;
}

.saved-recipes-view__row span:nth-child(2) {
  display: grid;
  gap: var(--space-1);
}

.saved-recipes-view__row small {
  display: inline-flex;
  gap: var(--space-1);
  align-items: center;
  color: var(--color-secondary);
  font-size: 0.75rem;
}
</style>
