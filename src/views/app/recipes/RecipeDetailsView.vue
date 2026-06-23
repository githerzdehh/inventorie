<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import { getIngredientById } from '@/composables/ingredient-utils'
import { usePantryStore } from '@/stores/pantry'
import { useRecipesStore } from '@/stores/recipes'

const route = useRoute()
const pantryStore = usePantryStore()
const recipesStore = useRecipesStore()
const shareMessage = ref<string | null>(null)
const shareErrorMessage = ref<string | null>(null)
const shareSnackbarOpen = ref(false)

const recipe = computed(() => recipesStore.recipeById(String(route.params.id)))
const availableIngredientIds = computed(() =>
  pantryStore.items.map((item) => item.ingredientId).filter(Boolean),
)
const recipeMatch = computed(() =>
  recipe.value
    ? recipesStore
        .recipeMatches(availableIngredientIds.value)
        .find((match) => match.recipe.id === recipe.value?.id)
    : null,
)
const inInventoryIngredientIds = computed(() =>
  recipeMatch.value
    ? [
        ...recipeMatch.value.matchedRequiredIngredientIds,
        ...recipeMatch.value.matchedOptionalIngredientIds,
      ]
    : [],
)
const neededIngredientIds = computed(() => recipeMatch.value?.missingRequiredIngredientIds ?? [])
const optionalAddOnIngredientIds = computed(
  () => recipeMatch.value?.missingOptionalIngredientIds ?? recipe.value?.optionalIngredientIds ?? [],
)
const isSaved = computed(() =>
  recipe.value ? recipesStore.savedRecipeIds.includes(recipe.value.id) : false,
)
const recipeUrl = computed(() => {
  if (!recipe.value) {
    return ''
  }

  if (typeof window === 'undefined') {
    return `/app/recipes/${recipe.value.id}`
  }

  return new URL(`/app/recipes/${recipe.value.id}`, window.location.origin).toString()
})
const shareText = computed(() =>
  recipe.value
    ? `Try this Inventorie recipe: ${recipe.value.name}. ${recipe.value.description}`
    : '',
)
const socialShareLinks = computed(() => {
  if (!recipe.value) {
    return []
  }

  const encodedUrl = encodeURIComponent(recipeUrl.value)
  const encodedText = encodeURIComponent(shareText.value)
  const encodedTitle = encodeURIComponent(recipe.value.name)

  return [
    {
      label: 'Facebook',
      icon: 'mdi-facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'WhatsApp',
      icon: 'mdi-whatsapp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      label: 'X',
      icon: 'mdi-twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      label: 'Email',
      icon: 'mdi-email-outline',
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ]
})

function toggleSaved() {
  if (!recipe.value) {
    return
  }

  if (isSaved.value) {
    recipesStore.removeSavedRecipe(recipe.value.id)
    return
  }

  recipesStore.saveRecipe(recipe.value.id)
}

function getIngredientName(ingredientId: string): string {
  return getIngredientById(ingredientId)?.name ?? ingredientId
}

async function copyRecipeLink() {
  shareMessage.value = null
  shareErrorMessage.value = null

  try {
    await navigator.clipboard.writeText(recipeUrl.value)
    shareMessage.value = 'Recipe link copied.'
    shareSnackbarOpen.value = true
  } catch {
    shareErrorMessage.value = 'Could not copy the recipe link from this browser.'
  }
}

async function shareRecipe() {
  if (!recipe.value) {
    return
  }

  shareMessage.value = null
  shareErrorMessage.value = null

  try {
    if (navigator.share) {
      await navigator.share({
        title: recipe.value.name,
        text: shareText.value,
        url: recipeUrl.value,
      })
      shareMessage.value = 'Recipe shared.'
      shareSnackbarOpen.value = true
      return
    }

    await copyRecipeLink()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    shareErrorMessage.value = 'Could not open sharing from this browser.'
  }
}

onMounted(async () => {
  if (!pantryStore.items.length) {
    await pantryStore.loadPantryItems()
  }
})
</script>

<template>
  <section class="recipe-details-view app-page app-mobile-shell">
    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/cook" variant="tonal">
      Back
    </app-button>

    <template v-if="recipe">
      <header class="recipe-details-view__hero">
        <span class="recipe-details-view__icon">{{ recipe.imageIcon ?? '🍽️' }}</span>
        <div>
          <h1>{{ recipe.name }}</h1>
          <p>
            <v-icon icon="mdi-thumb-up-outline" />
            {{ recipe.likes ?? 0 }}
            <v-icon icon="mdi-clock-outline" />
            {{ recipe.estimatedMinutes - 5 }}-{{ recipe.estimatedMinutes }} mins
          </p>
          <div class="recipe-details-view__meta">
            <v-chip color="primary" size="small"
              >{{ recipe.ingredientIds.length }} ingredients</v-chip
            >
            <v-chip v-if="recipeMatch?.canCook" color="success" size="small">Ready to cook</v-chip>
            <v-chip v-else-if="recipeMatch" color="warning" size="small">
              {{ recipeMatch.matchedRequiredIngredientIds.length }} in inventory
            </v-chip>
          </div>
        </div>
        <button class="recipe-details-view__save" type="button" @click="toggleSaved">
          <v-icon :icon="isSaved ? 'mdi-bookmark' : 'mdi-bookmark-outline'" />
        </button>
      </header>

      <v-alert
        v-if="shareErrorMessage"
        class="recipe-details-view__share-alert"
        color="error"
        icon="mdi-alert-circle-outline"
        variant="tonal"
      >
        {{ shareErrorMessage }}
      </v-alert>

      <section class="recipe-details-view__share">
        <app-button icon="mdi-share-variant-outline" @click="shareRecipe">
          Share recipe
        </app-button>
        <app-button
          icon="mdi-link-variant"
          tone="secondary"
          variant="tonal"
          @click="copyRecipeLink"
        >
          Copy link
        </app-button>
        <div class="recipe-details-view__socials" aria-label="Share recipe on social platforms">
          <v-btn
            v-for="link in socialShareLinks"
            :key="link.label"
            :aria-label="`Share on ${link.label}`"
            :href="link.href"
            :icon="link.icon"
            rel="noopener noreferrer"
            target="_blank"
            variant="tonal"
          />
        </div>
      </section>

      <section class="recipe-details-view__box">
        <h2>Ingredients</h2>
        <div class="recipe-details-view__ingredient-grid">
          <div class="recipe-details-view__ingredient-group">
            <strong>In inventory</strong>
            <div class="recipe-details-view__chips">
              <v-chip
                v-for="ingredientId in inInventoryIngredientIds"
                :key="ingredientId"
                size="small"
              >
                {{ getIngredientName(ingredientId) }}
              </v-chip>
              <span v-if="!inInventoryIngredientIds.length" class="recipe-details-view__empty-chip">
                None yet
              </span>
            </div>
          </div>
          <div class="recipe-details-view__ingredient-group">
            <strong>Needed</strong>
            <div class="recipe-details-view__chips">
              <v-chip
                v-for="ingredientId in neededIngredientIds"
                :key="ingredientId"
                size="small"
                variant="tonal"
              >
                {{ getIngredientName(ingredientId) }}
              </v-chip>
              <span v-if="!neededIngredientIds.length" class="recipe-details-view__empty-chip">
                Nothing required is missing
              </span>
            </div>
          </div>
          <div class="recipe-details-view__ingredient-group">
            <strong>Optional add-ons</strong>
            <div class="recipe-details-view__chips">
              <v-chip
                v-for="ingredientId in optionalAddOnIngredientIds"
                :key="ingredientId"
                size="small"
                variant="outlined"
              >
                {{ getIngredientName(ingredientId) }}
              </v-chip>
              <span
                v-if="!optionalAddOnIngredientIds.length"
                class="recipe-details-view__empty-chip"
              >
                No optional add-ons missing
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="recipe-details-view__box recipe-details-view__steps">
        <h2>Steps to Prepare the Ingredients</h2>
        <ol>
          <li v-for="step in recipe.prepSteps" :key="step">{{ step }}</li>
        </ol>
      </section>

      <section class="recipe-details-view__box recipe-details-view__steps">
        <h2>Instructions</h2>
        <ol>
          <li v-for="step in recipe.instructions ?? recipe.steps" :key="step">{{ step }}</li>
        </ol>
      </section>
    </template>

    <empty-state
      v-else
      icon="mdi-book-open-page-variant-outline"
      title="Recipe not found"
      description="This recipe is not available."
      action-label="Browse recipes"
      action-to="/app/cook"
    />

    <v-snackbar v-model="shareSnackbarOpen" timeout="1600">
      <v-icon icon="mdi-check-circle-outline" start />
      {{ shareMessage }}
    </v-snackbar>
  </section>
</template>

<style scoped>
.recipe-details-view {
  display: grid;
  gap: var(--space-4);
  padding: calc(var(--space-4) + var(--safe-area-top)) var(--space-4) var(--space-10);
}

.recipe-details-view > :deep(.app-button) {
  width: fit-content;
}

.recipe-details-view__hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-4);
  background: var(--color-secondary-soft);
  border-radius: var(--radius-lg);
}

.recipe-details-view__icon {
  display: grid;
  width: 6rem;
  height: 6rem;
  place-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  font-size: 4rem;
}

.recipe-details-view h1,
.recipe-details-view p {
  margin: 0;
}

.recipe-details-view h1 {
  color: var(--color-primary);
  font-size: 1.55rem;
  line-height: 1.05;
}

.recipe-details-view p {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  color: var(--color-primary);
}

.recipe-details-view__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.recipe-details-view__save {
  color: var(--color-primary);
  background: transparent;
  border: 0;
  font-size: 1.8rem;
  cursor: pointer;
}

.recipe-details-view__share-alert {
  margin-inline: 0;
}

.recipe-details-view__share {
  display: grid;
  gap: var(--space-3);
}

.recipe-details-view__socials {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-details-view__socials :deep(.v-btn) {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.recipe-details-view__box {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  color: var(--color-primary);
  background: var(--color-surface-soft);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-xl);
}

.recipe-details-view__box h2 {
  margin: calc(var(--space-4) * -1) calc(var(--space-4) * -1) 0;
  padding: var(--space-2);
  color: var(--color-secondary-soft);
  background: var(--color-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  font-size: 1.2rem;
  text-align: center;
}

.recipe-details-view__ingredient-grid {
  display: grid;
  gap: var(--space-3);
}

.recipe-details-view__ingredient-group {
  display: grid;
  gap: var(--space-2);
}

.recipe-details-view__ingredient-group strong {
  color: var(--color-primary-dark);
  font-size: 0.84rem;
  text-transform: uppercase;
}

.recipe-details-view__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.recipe-details-view__empty-chip {
  color: var(--color-muted);
  font-size: 0.9rem;
}

.recipe-details-view ul,
.recipe-details-view ol {
  margin: 0;
  padding-left: var(--space-6);
}

.recipe-details-view__steps li {
  margin-bottom: var(--space-2);
  font-size: 1.35rem;
  line-height: 1.25;
}
</style>
