<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import { useRecipesStore } from '@/stores/recipes'

const recipesStore = useRecipesStore()
</script>

<template>
  <section class="recipe-suggestions-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Cook</h2>
      <p>Offline recipe suggestions based on available pantry items.</p>
    </div>

    <v-row>
      <v-col v-for="recipe in recipesStore.recipes" :key="recipe.id" cols="12" md="6">
        <app-card
          :title="recipe.name"
          :subtitle="recipe.description"
          icon="mdi-silverware-fork-knife"
        >
          <div class="recipe-suggestions-view__meta">
            <v-chip
              class="recipe-suggestions-view__chip recipe-suggestions-view__chip--warm"
              size="small"
            >
              <v-icon icon="mdi-clock-outline" start />
              {{ recipe.estimatedMinutes }} min
            </v-chip>
            <v-chip
              v-if="recipe.offlineAvailable"
              class="recipe-suggestions-view__chip recipe-suggestions-view__chip--accent"
              size="small"
            >
              <v-icon icon="mdi-wifi-off" start />
              Offline
            </v-chip>
          </div>

          <template #actions>
            <app-button
              :to="`/app/recipes/${recipe.id}`"
              tone="secondary"
              variant="tonal"
              icon="mdi-book-open-page-variant-outline"
            >
              View recipe
            </app-button>
          </template>
        </app-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.recipe-suggestions-view__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-suggestions-view__chip {
  border: 1px solid transparent;
}

.recipe-suggestions-view__chip--warm {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border-color: color-mix(in srgb, var(--color-secondary) 36%, transparent);
}

.recipe-suggestions-view__chip--accent {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border-color: color-mix(in srgb, var(--color-accent) 34%, transparent);
}
</style>
