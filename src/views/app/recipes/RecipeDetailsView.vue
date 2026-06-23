<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import EmptyState from '@/components/common/empty-state.vue'
import { useRecipesStore } from '@/stores/recipes'

const route = useRoute()
const recipesStore = useRecipesStore()

const recipe = computed(() => recipesStore.recipeById(String(route.params.id)))
</script>

<template>
  <section class="recipe-details-view app-page app-stack">
    <app-button to="/app/cook" tone="ghost" variant="tonal" icon="mdi-arrow-left">
      Back to cook
    </app-button>

    <app-card
      v-if="recipe"
      :title="recipe.name"
      :subtitle="`${recipe.estimatedMinutes} minute recipe`"
      icon="mdi-book-open-page-variant-outline"
    >
      <p>{{ recipe.description }}</p>

      <div class="recipe-details-view__chips">
        <v-chip v-for="tag in recipe.tags" :key="tag" class="recipe-details-view__tag" size="small">
          {{ tag }}
        </v-chip>
      </div>

      <v-list class="recipe-details-view__steps" lines="two">
        <v-list-subheader>Steps</v-list-subheader>
        <v-list-item v-for="(step, index) in recipe.steps" :key="step">
          <template #prepend>
            <v-avatar class="recipe-details-view__step-number" size="32">{{ index + 1 }}</v-avatar>
          </template>
          <v-list-item-title>{{ step }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #actions>
        <app-button
          icon="mdi-bookmark-outline"
          tone="secondary"
          @click="recipesStore.saveRecipe(recipe.id)"
        >
          Save recipe
        </app-button>
      </template>
    </app-card>

    <empty-state
      v-else
      icon="mdi-book-open-page-variant-outline"
      title="Recipe not found"
      description="This mock recipe is not available in the offline starter set."
      action-label="Browse recipes"
      action-to="/app/cook"
    />
  </section>
</template>

<style scoped>
.recipe-details-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.recipe-details-view__steps {
  background: transparent;
}

.recipe-details-view__tag,
.recipe-details-view__step-number {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 36%, transparent);
}
</style>
