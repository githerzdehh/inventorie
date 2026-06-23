<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import SelectMenuField from '@/components/common/select-menu-field.vue'
import PantryItemCard from '@/components/pantry/pantry-item-card.vue'
import type { PantryItem, StorageLocation } from '@/composables/app-types'
import { ingredientOptions } from '@/composables/ingredient-utils'
import {
  getQuantityInputMode,
  quantityUnitOptions,
  validateQuantityInput,
} from '@/composables/quantity-utils'
import { storageLocationLabels, usePantryStore } from '@/stores/pantry'

interface ManualItemForm {
  ingredientId: string | null
  displayName: string
  description: string
  quantity: string
  unit: string
  storageLocation: StorageLocation
  estimatedUseByDate: string
}

const pantryStore = usePantryStore()
const route = useRoute()
const searchQuery = ref('')
const sortMode = ref('recent')
const manualDialogOpen = ref(false)
const isSavingManualItem = ref(false)
const manualSaveErrorMessage = ref<string | null>(null)
const showManualSaveSnackbar = ref(false)
const manualForm = reactive<ManualItemForm>({
  ingredientId: null,
  displayName: '',
  description: '',
  quantity: '1',
  unit: 'item',
  storageLocation: 'pantry',
  estimatedUseByDate: '',
})

const sortOptions = [
  { title: 'Sort by Recently Added', value: 'recent' },
  { title: 'Sort by Expiring Soon', value: 'expiry' },
  { title: 'Sort by Needs Restocking', value: 'restock' },
  { title: 'Sort A-Z', value: 'az' },
]
const storageLocationItems = (
  Object.entries(storageLocationLabels) as Array<[StorageLocation, string]>
).map(([value, title]) => ({
  value,
  title,
}))
const selectedManualIngredient = computed(
  () =>
    ingredientOptions.find((ingredient) => ingredient.value === manualForm.ingredientId) ?? null,
)
const manualQuantityValidation = computed(() =>
  validateQuantityInput(manualForm.quantity, manualForm.unit),
)
const manualQuantityErrorMessage = computed(() => manualQuantityValidation.value.errorMessage)

function isPantryItemRecord(item: unknown): item is Partial<PantryItem> {
  return Boolean(item) && typeof item === 'object'
}

const safePantryItems = computed<Partial<PantryItem>[]>(() =>
  Array.isArray(pantryStore.items) ? pantryStore.items.filter(isPantryItemRecord) : [],
)

const visibleItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const items = query
    ? safePantryItems.value.filter((item) =>
        String(item.displayName ?? '')
          .toLowerCase()
          .includes(query),
      )
    : safePantryItems.value

  return [...items].sort((first, second) => {
    if (sortMode.value === 'az') {
      return String(first.displayName ?? '').localeCompare(String(second.displayName ?? ''))
    }

    if (sortMode.value === 'expiry') {
      return String(first.estimatedUseByDate ?? '9999').localeCompare(
        String(second.estimatedUseByDate ?? '9999'),
      )
    }

    if (sortMode.value === 'restock') {
      return Number(first.quantity ?? 0) - Number(second.quantity ?? 0)
    }

    return String(second.addedAt ?? second.createdAt ?? '').localeCompare(
      String(first.addedAt ?? first.createdAt ?? ''),
    )
  })
})

function normalizeStorageLocation(location: unknown): StorageLocation {
  return typeof location === 'string' && location in storageLocationLabels
    ? (location as StorageLocation)
    : 'pantry'
}

function fromDateInputValue(dateInput: string): string | null {
  if (!dateInput) {
    return null
  }

  const date = new Date(`${dateInput}T00:00:00.000`)

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function resetManualForm() {
  manualForm.ingredientId = null
  manualForm.displayName = ''
  manualForm.description = ''
  manualForm.quantity = '1'
  manualForm.unit = 'item'
  manualForm.storageLocation = 'pantry'
  manualForm.estimatedUseByDate = ''
  manualSaveErrorMessage.value = null
}

function openManualDialog(prefill?: Partial<ManualItemForm>) {
  resetManualForm()
  if (prefill) {
    manualForm.ingredientId = prefill.ingredientId ?? null
    manualForm.displayName = prefill.displayName ?? ''
    manualForm.description = prefill.description ?? ''
    manualForm.quantity = prefill.quantity ?? '1'
    manualForm.unit = prefill.unit ?? 'item'
    manualForm.storageLocation = prefill.storageLocation ?? 'pantry'
    manualForm.estimatedUseByDate = prefill.estimatedUseByDate ?? ''
  }
  manualDialogOpen.value = true
}

async function saveManualItem() {
  if (isSavingManualItem.value) {
    return
  }

  const quantityResult = manualQuantityValidation.value

  if (quantityResult.errorMessage || !quantityResult.quantity) {
    manualSaveErrorMessage.value = quantityResult.errorMessage ?? 'Quantity is invalid.'
    return
  }

  isSavingManualItem.value = true
  manualSaveErrorMessage.value = null

  try {
    await pantryStore.addManualItem({
      ingredientId: manualForm.ingredientId,
      displayName: manualForm.displayName.trim(),
      description: manualForm.description,
      quantity: quantityResult.quantity,
      unit: manualForm.unit,
      storageLocation: manualForm.storageLocation,
      estimatedUseByDate: fromDateInputValue(manualForm.estimatedUseByDate),
    })
    manualDialogOpen.value = false
    showManualSaveSnackbar.value = true
    resetManualForm()
  } catch (error) {
    manualSaveErrorMessage.value =
      error instanceof Error ? error.message : 'Could not add this item.'
  } finally {
    isSavingManualItem.value = false
  }
}

onMounted(async () => {
  await pantryStore.loadPantryItems()

  if (route.query.dialog === 'manual') {
    openManualDialog({
      ingredientId: typeof route.query.ingredientId === 'string' ? route.query.ingredientId : null,
      displayName: typeof route.query.displayName === 'string' ? route.query.displayName : '',
      quantity: typeof route.query.quantity === 'string' ? route.query.quantity : '1',
      unit: typeof route.query.unit === 'string' ? route.query.unit : 'item',
    })
  }
})

watch(
  () => manualForm.ingredientId,
  () => {
    if (selectedManualIngredient.value && !manualForm.displayName.trim()) {
      manualForm.displayName = selectedManualIngredient.value.title
    }
  },
)
</script>

<template>
  <section class="pantry-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>INVENTORY</h1>
    </header>

    <div class="pantry-view__controls">
      <v-text-field
        v-model="searchQuery"
        clearable
        hide-details
        placeholder="Search here..."
        variant="outlined"
      />
      <v-select v-model="sortMode" :items="sortOptions" hide-details variant="outlined" />
      <div class="pantry-view__actions">
        <app-button block icon="mdi-image-search-outline" to="/app/scan">Add from scan</app-button>
        <app-button
          block
          icon="mdi-plus-circle-outline"
          tone="secondary"
          variant="tonal"
          @click="openManualDialog"
        >
          Add manually
        </app-button>
      </div>
    </div>

    <v-alert
      v-if="pantryStore.errorMessage"
      color="error"
      icon="mdi-alert-circle-outline"
      variant="tonal"
    >
      {{ pantryStore.errorMessage }}
    </v-alert>

    <div v-if="pantryStore.isLoading" class="pantry-view__loading">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <div v-else-if="visibleItems.length" class="pantry-view__list">
      <pantry-item-card
        v-for="(item, index) in visibleItems"
        :key="`${item.id ?? 'pantry-item'}-${index}`"
        :item="item"
        @delete="pantryStore.deletePantryItem"
      />
    </div>

    <empty-state
      v-else
      icon="mdi-fridge-outline"
      title="Nothing further"
      description="Scan a grocery image or add an item manually to build your inventory."
      action-label="Add item"
      @action="openManualDialog"
    />

    <v-dialog v-model="manualDialogOpen" max-width="620">
      <v-card class="pantry-view__manual-dialog" border elevation="8">
        <v-card-item>
          <template #prepend>
            <v-avatar class="pantry-view__manual-icon" size="44">
              <v-icon icon="mdi-plus-circle-outline" />
            </v-avatar>
          </template>
          <v-card-title>Add inventory item</v-card-title>
          <v-card-subtitle>Save an item without scanning.</v-card-subtitle>
          <template #append>
            <v-btn
              aria-label="Close manual item form"
              icon="mdi-close"
              variant="text"
              @click="manualDialogOpen = false"
            />
          </template>
        </v-card-item>

        <v-card-text class="pantry-view__manual-content">
          <v-alert
            v-if="manualSaveErrorMessage"
            color="error"
            icon="mdi-alert-circle-outline"
            variant="tonal"
          >
            {{ manualSaveErrorMessage }}
          </v-alert>

          <v-autocomplete
            v-model="manualForm.ingredientId"
            :items="ingredientOptions"
            clearable
            item-title="title"
            item-value="value"
            label="Known ingredient"
            variant="outlined"
          />

          <v-text-field v-model="manualForm.displayName" label="Item name" variant="outlined" />

          <v-text-field v-model="manualForm.description" label="Description" variant="outlined" />

          <div class="pantry-view__manual-fields">
            <v-text-field
              v-model="manualForm.quantity"
              :error-messages="manualQuantityErrorMessage ? [manualQuantityErrorMessage] : []"
              :inputmode="getQuantityInputMode(manualForm.unit)"
              label="Quantity"
              type="text"
              variant="outlined"
            />
            <select-menu-field
              v-model="manualForm.unit"
              :items="quantityUnitOptions"
              label="Unit"
            />
          </div>

          <select-menu-field
            :model-value="manualForm.storageLocation"
            :items="storageLocationItems"
            label="Storage location"
            @update:model-value="manualForm.storageLocation = normalizeStorageLocation($event)"
          />

          <v-text-field
            v-model="manualForm.estimatedUseByDate"
            label="Expiration date"
            type="date"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions class="pantry-view__manual-actions">
          <app-button
            :disabled="!manualForm.displayName.trim()"
            :loading="isSavingManualItem"
            icon="mdi-content-save-outline"
            @click="saveManualItem"
          >
            Save item
          </app-button>
          <app-button tone="ghost" variant="tonal" @click="manualDialogOpen = false">
            Cancel
          </app-button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="showManualSaveSnackbar" timeout="1600">
      <v-icon icon="mdi-check-circle-outline" start />
      Item added to your inventory.
    </v-snackbar>
  </section>
</template>

<style scoped>
.pantry-view {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-10);
}

.pantry-view__controls,
.pantry-view__list {
  display: grid;
  gap: var(--space-4);
  padding-inline: var(--space-4);
}

.pantry-view__actions {
  display: grid;
  gap: var(--space-3);
}

.pantry-view__controls :deep(.v-field) {
  color: var(--color-surface);
  background: #005bd7;
  border-radius: var(--radius-xl);
}

.pantry-view__controls :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.7);
  opacity: 1;
}

.pantry-view__loading {
  display: grid;
  min-height: 10rem;
  place-items: center;
}

.pantry-view__manual-dialog {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
}

.pantry-view__manual-icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.pantry-view__manual-content {
  display: grid;
  gap: var(--space-3);
}

.pantry-view__manual-fields {
  display: grid;
  gap: var(--space-3);
}

.pantry-view__manual-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

@media (min-width: 680px) {
  .pantry-view__actions,
  .pantry-view__manual-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
