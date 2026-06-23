<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import type { RecipeMatch } from '@/stores/recipes'
import { usePantryStore } from '@/stores/pantry'
import { getIngredientById } from '@/composables/ingredient-utils'
import { useRecipesStore } from '@/stores/recipes'

const pantryStore = usePantryStore()
const recipesStore = useRecipesStore()
const activeTab = ref<'browse' | 'inventory'>('browse')
const browseSearchQuery = ref('')
const inventorySearchQuery = ref('')
const selectedTags = ref<string[]>([])

const availableIngredientIds = computed(() =>
  pantryStore.items.map((item) => item.ingredientId).filter(Boolean),
)
const recipeMatches = computed(() => recipesStore.recipeMatches(availableIngredientIds.value))
const availableIngredients = computed(() =>
  pantryStore.items
    .map((item) => item.ingredientId)
    .filter((ingredientId): ingredientId is string => Boolean(ingredientId))
    .map((ingredientId) => getIngredientById(ingredientId)?.name ?? ingredientId),
)
const allRecipeTags = computed(() =>
  Array.from(
    new Set(recipesStore.recipes.flatMap((recipe) => recipe.tags.map((tag) => tag.trim()))),
  ).sort((first, second) => first.localeCompare(second)),
)
const browseMatches = computed(() => {
  const query = browseSearchQuery.value.trim().toLowerCase()
  const tags = new Set(selectedTags.value)

  return recipesStore.recipes
    .map((recipe) => {
      const match = recipeMatches.value.find((candidate) => candidate.recipe.id === recipe.id)

      return match
    })
    .filter((match): match is RecipeMatch => Boolean(match))
    .filter((match) => {
      const matchesQuery = query
        ? [match.recipe.name, match.recipe.description, ...match.recipe.tags].some((value) =>
            value.toLowerCase().includes(query),
          )
        : true
      const matchesTags = tags.size
        ? match.recipe.tags.some((tag) => tags.has(tag))
        : true

      return matchesQuery && matchesTags
    })
})
const inventoryMatches = computed(() => {
  const query = inventorySearchQuery.value.trim().toLowerCase()

  return recipeMatches.value.filter((match) => {
    const matchesQuery = query
      ? [match.recipe.name, match.recipe.description, ...match.recipe.tags].some((value) =>
          value.toLowerCase().includes(query),
        )
      : true

    return matchesQuery
  })
})
const bestFromInventory = computed(() =>
  [...browseMatches.value]
    .filter((match) => match.matchedRequiredIngredientIds.length > 0)
    .sort((first, second) => {
      if (Number(second.canCook) !== Number(first.canCook)) {
        return Number(second.canCook) - Number(first.canCook)
      }

      const requiredCoverageFirst = first.requiredIngredientIds.length
        ? first.matchedRequiredIngredientIds.length / first.requiredIngredientIds.length
        : 1
      const requiredCoverageSecond = second.requiredIngredientIds.length
        ? second.matchedRequiredIngredientIds.length / second.requiredIngredientIds.length
        : 1

      if (requiredCoverageSecond !== requiredCoverageFirst) {
        return requiredCoverageSecond - requiredCoverageFirst
      }

      return second.matchScore - first.matchScore
    })
    .slice(0, 3),
)
const readyToCook = computed(() => inventoryMatches.value.filter((match) => match.canCook))
const almostReady = computed(
  () =>
    inventoryMatches.value.filter(
      (match) => !match.canCook && match.matchedRequiredIngredientIds.length > 0,
    ),
)
const hasInventory = computed(() => availableIngredientIds.value.length > 0)

function toggleSaved(recipeId: string) {
  if (recipesStore.savedRecipeIds.includes(recipeId)) {
    recipesStore.removeSavedRecipe(recipeId)
    return
  }

  recipesStore.saveRecipe(recipeId)
}

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((value) => value !== tag)
    : [...selectedTags.value, tag]
}

function getMatchLabel(match: RecipeMatch): string {
  if (match.canCook) {
    return match.missingOptionalIngredientIds.length
      ? 'Ready; optional add-ons available'
      : 'Ready from inventory'
  }

  return `${match.matchedRequiredIngredientIds.length}/${match.requiredIngredientIds.length} required in inventory`
}

function getAvailableLabel(match: RecipeMatch): string {
  const totalAvailable = match.matchedRequiredIngredientIds.length + match.matchedOptionalIngredientIds.length

  return `${totalAvailable} in inventory`
}

function getIngredientName(ingredientId: string): string {
  return getIngredientById(ingredientId)?.name ?? ingredientId
}

function getInInventoryIngredientIds(match: RecipeMatch): string[] {
  return [...match.matchedRequiredIngredientIds, ...match.matchedOptionalIngredientIds]
}

function makeAddToInventoryQuery(match: RecipeMatch) {
  const ingredientId = match.missingRequiredIngredientIds[0] ?? match.missingOptionalIngredientIds[0]
  const ingredient = ingredientId ? getIngredientById(ingredientId) : null

  return {
    ingredientId,
    displayName: ingredient?.name ?? match.recipe.name,
    quantity: '1',
    unit: ingredient?.defaultUnit ?? 'item',
    dialog: 'manual',
  }
}

onMounted(async () => {
  if (!pantryStore.items.length) {
    await pantryStore.loadPantryItems()
  }
})
</script>

<template>
  <section class="recipe-book-view app-page app-mobile-shell">
    <div class="recipe-book-view__header">
      <div class="recipe-book-view__heading">
        <p>Recipes</p>
        <h1>Find what fits your inventory</h1>
      </div>
      <router-link class="recipe-book-view__saved" to="/app/saved">
        <v-icon icon="mdi-bookmark-outline" />
        <span>Saved</span>
      </router-link>
    </div>

    <v-tabs
      v-model="activeTab"
      class="recipe-book-view__tabs"
      color="primary"
      grow
      density="compact"
    >
      <v-tab value="browse">Browse Recipes</v-tab>
      <v-tab value="inventory">From Inventory</v-tab>
    </v-tabs>

    <section v-if="activeTab === 'browse'" class="recipe-book-view__panel">
      <v-text-field
        v-model="browseSearchQuery"
        clearable
        hide-details
        placeholder="Search recipes"
        variant="outlined"
      />

      <div class="recipe-book-view__chips">
        <v-chip
          v-for="tag in allRecipeTags"
          :key="tag"
          :variant="selectedTags.includes(tag) ? 'flat' : 'tonal'"
          color="primary"
          filter
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </v-chip>
      </div>

      <div v-if="bestFromInventory.length" class="recipe-book-view__best">
        <div class="recipe-book-view__row-heading">
          <h2>Best from your inventory</h2>
          <span>These recipes use the most of what you already have.</span>
        </div>
        <div class="recipe-book-view__cards recipe-book-view__cards--row">
          <article
            v-for="match in bestFromInventory"
            :key="match.recipe.id"
            class="recipe-book-view__card"
          >
            <button
              class="recipe-book-view__bookmark"
              type="button"
              :aria-label="`Save ${match.recipe.name}`"
              @click="toggleSaved(match.recipe.id)"
            >
              <v-icon
                :icon="
                  recipesStore.savedRecipeIds.includes(match.recipe.id)
                    ? 'mdi-bookmark'
                    : 'mdi-bookmark-outline'
                "
              />
            </button>
            <router-link :to="`/app/recipes/${match.recipe.id}`" class="recipe-book-view__recipe">
              <span class="recipe-book-view__recipe-icon">{{ match.recipe.imageIcon ?? '🍽️' }}</span>
              <strong>{{ match.recipe.name }}</strong>
              <small>{{ getMatchLabel(match) }}</small>
            </router-link>
          </article>
        </div>
      </div>

      <div class="recipe-book-view__catalog">
        <div class="recipe-book-view__row-heading">
          <h2>Browse the catalog</h2>
          <span>Saved recipes stay here too.</span>
        </div>

        <div v-if="browseMatches.length" class="recipe-book-view__cards">
          <article
            v-for="match in browseMatches"
            :key="match.recipe.id"
            class="recipe-book-view__card recipe-book-view__card--wide"
          >
            <button
              class="recipe-book-view__bookmark"
              type="button"
              :aria-label="`Save ${match.recipe.name}`"
              @click="toggleSaved(match.recipe.id)"
            >
              <v-icon
                :icon="
                  recipesStore.savedRecipeIds.includes(match.recipe.id)
                    ? 'mdi-bookmark'
                    : 'mdi-bookmark-outline'
                "
              />
            </button>
            <router-link :to="`/app/recipes/${match.recipe.id}`" class="recipe-book-view__recipe">
              <span class="recipe-book-view__recipe-icon">{{ match.recipe.imageIcon ?? '🍽️' }}</span>
              <strong>{{ match.recipe.name }}</strong>
              <small>
                <v-icon icon="mdi-thumb-up-outline" size="small" />
                {{ match.recipe.likes ?? 0 }}
                <v-icon icon="mdi-clock-outline" size="small" />
                {{ match.recipe.estimatedMinutes }} mins
              </small>
              <v-chip class="recipe-book-view__match-chip" size="x-small">
                {{ getAvailableLabel(match) }}
              </v-chip>
              <v-chip class="recipe-book-view__match-chip" size="x-small" variant="tonal">
                {{ getMatchLabel(match) }}
              </v-chip>
            </router-link>
            <div class="recipe-book-view__card-actions">
              <app-button :to="`/app/recipes/${match.recipe.id}`" icon="mdi-eye-outline" variant="tonal">
                View recipe
              </app-button>
              <app-button
                v-if="match.missingRequiredIngredientIds.length || match.missingOptionalIngredientIds.length"
                :to="{ path: '/app/pantry', query: makeAddToInventoryQuery(match) }"
                icon="mdi-plus-circle-outline"
                tone="secondary"
                variant="tonal"
              >
                Add to inventory
              </app-button>
            </div>
            <div class="recipe-book-view__ingredient-groups">
              <div class="recipe-book-view__ingredient-group">
                <strong>In inventory</strong>
                <div class="recipe-book-view__chips">
                  <v-chip
                    v-for="ingredientId in getInInventoryIngredientIds(match)"
                    :key="ingredientId"
                    size="small"
                  >
                    {{ getIngredientName(ingredientId) }}
                  </v-chip>
                  <span
                    v-if="!getInInventoryIngredientIds(match).length"
                    class="recipe-book-view__empty-chip"
                  >
                    None yet
                  </span>
                </div>
              </div>
              <div class="recipe-book-view__ingredient-group">
                <strong>Missing required</strong>
                <div class="recipe-book-view__chips">
                  <v-chip
                    v-for="ingredientId in match.missingRequiredIngredientIds"
                    :key="ingredientId"
                    size="small"
                    variant="tonal"
                  >
                    {{ getIngredientName(ingredientId) }}
                  </v-chip>
                  <span
                    v-if="!match.missingRequiredIngredientIds.length"
                    class="recipe-book-view__empty-chip"
                  >
                    No required gaps
                  </span>
                </div>
              </div>
              <div class="recipe-book-view__ingredient-group">
                <strong>Optional add-ons</strong>
                <div class="recipe-book-view__chips">
                  <v-chip
                    v-for="ingredientId in match.missingOptionalIngredientIds"
                    :key="ingredientId"
                    size="small"
                    variant="outlined"
                  >
                    {{ getIngredientName(ingredientId) }}
                  </v-chip>
                  <span
                    v-if="!match.missingOptionalIngredientIds.length"
                    class="recipe-book-view__empty-chip"
                  >
                    No optional add-ons missing
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <empty-state
          v-else
          icon="mdi-book-open-page-variant-outline"
          title="No recipes match this search"
          description="Clear filters or search for another recipe name or category."
        />
      </div>
    </section>

    <section v-else class="recipe-book-view__panel">
      <div class="recipe-book-view__inventory-summary">
        <div class="recipe-book-view__row-heading">
          <h2>Inventory ingredients</h2>
          <span>These are the items used to rank recipe matches.</span>
        </div>
        <div v-if="hasInventory" class="recipe-book-view__chips">
          <v-chip v-for="ingredient in availableIngredients" :key="ingredient" size="small">
            {{ ingredient }}
          </v-chip>
        </div>
        <empty-state
          v-else
          icon="mdi-fridge-outline"
          title="Nothing in inventory yet"
          description="Add or scan pantry items, then come back for inventory-first recipe picks."
          action-label="Open inventory"
          action-to="/app/pantry"
        />
      </div>

      <v-text-field
        v-model="inventorySearchQuery"
        clearable
        hide-details
        placeholder="Search recipes"
        variant="outlined"
      />

      <div v-if="readyToCook.length" class="recipe-book-view__section">
        <div class="recipe-book-view__row-heading">
          <h2>Ready to cook</h2>
          <span>Everything required is already in your pantry.</span>
        </div>
        <div class="recipe-book-view__cards">
          <article v-for="match in readyToCook" :key="match.recipe.id" class="recipe-book-view__card">
            <router-link :to="`/app/recipes/${match.recipe.id}`" class="recipe-book-view__recipe">
              <span class="recipe-book-view__recipe-icon">{{ match.recipe.imageIcon ?? '🍽️' }}</span>
              <strong>{{ match.recipe.name }}</strong>
              <small>{{ getMatchLabel(match) }}</small>
            </router-link>
            <div class="recipe-book-view__card-actions">
              <app-button :to="`/app/recipes/${match.recipe.id}`" icon="mdi-eye-outline" variant="tonal">
                View recipe
              </app-button>
              <app-button
                v-if="match.missingOptionalIngredientIds.length"
                :to="{ path: '/app/pantry', query: makeAddToInventoryQuery(match) }"
                icon="mdi-plus-circle-outline"
                tone="secondary"
                variant="tonal"
              >
                Add to inventory
              </app-button>
            </div>
          </article>
        </div>
      </div>

      <div v-if="almostReady.length" class="recipe-book-view__section">
        <div class="recipe-book-view__row-heading">
          <h2>Almost ready</h2>
          <span>One or more required ingredients are still missing.</span>
        </div>
        <div class="recipe-book-view__cards">
          <article v-for="match in almostReady" :key="match.recipe.id" class="recipe-book-view__card">
            <router-link :to="`/app/recipes/${match.recipe.id}`" class="recipe-book-view__recipe">
              <span class="recipe-book-view__recipe-icon">{{ match.recipe.imageIcon ?? '🍽️' }}</span>
              <strong>{{ match.recipe.name }}</strong>
              <small>{{ getMatchLabel(match) }}</small>
            </router-link>
            <div class="recipe-book-view__card-actions">
              <app-button :to="`/app/recipes/${match.recipe.id}`" icon="mdi-eye-outline" variant="tonal">
                View recipe
              </app-button>
              <app-button
                :to="{ path: '/app/pantry', query: makeAddToInventoryQuery(match) }"
                icon="mdi-plus-circle-outline"
                tone="secondary"
                variant="tonal"
              >
                Add to inventory
              </app-button>
            </div>
          </article>
        </div>
      </div>

      <empty-state
        v-if="!readyToCook.length && !almostReady.length"
        icon="mdi-silverware-fork-knife"
        title="Nothing ready yet"
        description="Add pantry items to see recipe matches in this tab."
        action-label="Open inventory"
        action-to="/app/pantry"
      />
    </section>
  </section>
</template>

<style scoped>
.recipe-book-view {
  display: grid;
  gap: var(--space-4);
  padding: calc(var(--space-4) + var(--safe-area-top)) var(--space-4) var(--space-10);
}

.recipe-book-view__header {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  justify-content: space-between;
}

.recipe-book-view__heading {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.recipe-book-view__heading p,
.recipe-book-view__heading h1,
.recipe-book-view__row-heading h2,
.recipe-book-view__row-heading span {
  margin: 0;
}

.recipe-book-view__heading p {
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.recipe-book-view__heading h1 {
  color: var(--color-primary);
  font-size: 1.8rem;
  line-height: 1.02;
}

.recipe-book-view__saved {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  color: var(--color-primary);
  white-space: nowrap;
}

.recipe-book-view__tabs {
  margin-inline: calc(var(--space-4) * -1);
}

.recipe-book-view__panel,
.recipe-book-view__section,
.recipe-book-view__catalog,
.recipe-book-view__best,
.recipe-book-view__inventory-summary {
  display: grid;
  gap: var(--space-4);
}

.recipe-book-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-book-view__row-heading {
  display: grid;
  gap: 0.15rem;
}

.recipe-book-view__row-heading h2 {
  color: var(--color-primary);
  font-size: 1.05rem;
}

.recipe-book-view__row-heading span {
  color: var(--color-muted);
  font-size: 0.88rem;
}

.recipe-book-view__cards {
  display: grid;
  gap: var(--space-3);
}

.recipe-book-view__cards--row {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.recipe-book-view__card {
  position: relative;
  display: grid;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
}

.recipe-book-view__card--wide {
  gap: var(--space-4);
}

.recipe-book-view__bookmark {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  color: var(--color-primary);
  background: transparent;
  border: 0;
}

.recipe-book-view__recipe {
  display: grid;
  gap: var(--space-2);
  color: var(--color-primary);
}

.recipe-book-view__recipe-icon {
  display: grid;
  width: 4.2rem;
  height: 4.2rem;
  place-items: center;
  font-size: 2.4rem;
  background: color-mix(in srgb, var(--color-secondary-soft) 70%, white);
  border-radius: var(--radius-lg);
}

.recipe-book-view__recipe strong {
  font-size: 1.1rem;
  line-height: 1.1;
}

.recipe-book-view__recipe small {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  align-items: center;
  color: var(--color-muted);
  font-size: 0.78rem;
}

.recipe-book-view__match-chip {
  width: fit-content;
  max-width: 100%;
}

.recipe-book-view__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-book-view__ingredient-groups {
  display: grid;
  gap: var(--space-3);
}

.recipe-book-view__ingredient-group {
  display: grid;
  gap: var(--space-2);
}

.recipe-book-view__ingredient-group strong {
  color: var(--color-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
}

.recipe-book-view__empty-chip {
  color: var(--color-muted);
  font-size: 0.82rem;
}

@media (min-width: 760px) {
  .recipe-book-view__cards--row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
