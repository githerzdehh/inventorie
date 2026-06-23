<script setup lang="ts">
import { reactive, watch } from 'vue'
import SelectMenuField from '@/components/common/select-menu-field.vue'
import type { DetectedReceiptItem, StorageLocation } from '@/composables/app-types'
import {
  formatQuantity,
  getQuantityInputMode,
  quantityUnitOptions,
  validateQuantityInput,
} from '@/composables/quantity-utils'
import { storageLocationLabels } from '@/stores/pantry'

const props = withDefaults(
  defineProps<{
    items: DetectedReceiptItem[]
    showDiagnostics?: boolean
  }>(),
  {
    showDiagnostics: false,
  },
)

const emit = defineEmits<{
  update: [id: string, updates: Partial<DetectedReceiptItem>]
  toggle: [id: string]
  remove: [id: string]
}>()

const quantityDrafts = reactive<Record<string, string>>({})
const quantityErrors = reactive<Record<string, string | null>>({})
const storageLocationItems = (
  Object.entries(storageLocationLabels) as Array<[StorageLocation, string]>
).map(([value, title]) => ({
  value,
  title,
}))

function syncQuantityDrafts() {
  for (const item of props.items) {
    if (typeof quantityDrafts[item.id] === 'undefined') {
      quantityDrafts[item.id] = formatQuantity(item.quantity)
      quantityErrors[item.id] = validateQuantityInput(item.quantity, item.unit).errorMessage
    }
  }

  for (const itemId of Object.keys(quantityDrafts)) {
    if (!props.items.some((item) => item.id === itemId)) {
      delete quantityDrafts[itemId]
      delete quantityErrors[itemId]
    }
  }
}

function handleQuantityUpdate(item: DetectedReceiptItem, value: unknown) {
  const rawValue = String(value ?? '')
  const result = validateQuantityInput(rawValue, item.unit)

  quantityDrafts[item.id] = rawValue
  quantityErrors[item.id] = result.errorMessage
  emit('update', item.id, {
    quantity: result.quantity ?? Number.NaN,
  })
}

function handleUnitUpdate(item: DetectedReceiptItem, unit: string) {
  const result = validateQuantityInput(quantityDrafts[item.id] ?? item.quantity, unit)

  quantityErrors[item.id] = result.errorMessage
  emit('update', item.id, {
    unit,
    quantity: result.quantity ?? Number.NaN,
  })
}

function normalizeStorageLocation(location: unknown): StorageLocation {
  return typeof location === 'string' && location in storageLocationLabels
    ? (location as StorageLocation)
    : 'pantry'
}

function toDateInputValue(dateInput: string | null | undefined): string {
  if (!dateInput) {
    return ''
  }

  const date = new Date(dateInput)

  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

function fromDateInputValue(dateInput: string): string | null {
  if (!dateInput) {
    return null
  }

  const date = new Date(`${dateInput}T00:00:00.000`)

  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function getQuantityErrorMessages(itemId: string): string[] {
  const errorMessage = quantityErrors[itemId]

  return errorMessage ? [errorMessage] : []
}

watch(() => props.items, syncQuantityDrafts, { deep: true, immediate: true })
</script>

<template>
  <v-list class="detected-item-list" lines="three">
    <v-list-item
      v-for="item in items"
      :key="item.id"
      class="detected-item-list__item"
      :class="{ 'detected-item-list__item--selected': item.selected }"
    >
      <template #prepend>
        <v-checkbox
          :model-value="item.selected"
          aria-label="Select detected item"
          color="primary"
          hide-details
          @update:model-value="emit('toggle', item.id)"
        />
      </template>

      <div class="detected-item-list__body">
        <div class="detected-item-list__fields">
          <v-text-field
            :model-value="item.displayName"
            density="compact"
            hide-details
            label="Item"
            variant="outlined"
            @update:model-value="emit('update', item.id, { displayName: String($event) })"
          />
          <v-text-field
            :model-value="item.description"
            density="compact"
            hide-details
            label="Description"
            variant="outlined"
            @update:model-value="
              emit('update', item.id, { description: String($event).trim() || null })
            "
          />
          <v-text-field
            :error-messages="getQuantityErrorMessages(item.id)"
            :hide-details="quantityErrors[item.id] ? false : true"
            :inputmode="getQuantityInputMode(item.unit)"
            :model-value="quantityDrafts[item.id] ?? formatQuantity(item.quantity)"
            density="compact"
            label="Quantity"
            type="text"
            variant="outlined"
            @update:model-value="handleQuantityUpdate(item, $event)"
          />
          <select-menu-field
            :model-value="item.unit"
            :items="quantityUnitOptions"
            label="Unit"
            @update:model-value="handleUnitUpdate(item, $event)"
          />
          <select-menu-field
            :model-value="item.storageLocation ?? 'pantry'"
            :items="storageLocationItems"
            label="Storage"
            @update:model-value="
              emit('update', item.id, { storageLocation: normalizeStorageLocation($event) })
            "
          />
          <v-text-field
            :model-value="toDateInputValue(item.estimatedUseByDate)"
            density="compact"
            hide-details
            label="Expiration date"
            type="date"
            variant="outlined"
            @update:model-value="
              emit('update', item.id, { estimatedUseByDate: fromDateInputValue(String($event)) })
            "
          />
        </div>

        <div v-if="showDiagnostics" class="detected-item-list__meta">
          <v-chip class="detected-item-list__chip detected-item-list__chip--accent" size="small">
            {{ Math.round(item.confidence * 100) }}% confidence
          </v-chip>
          <v-chip
            v-if="item.ingredientId"
            class="detected-item-list__chip detected-item-list__chip--matched"
            size="small"
          >
            <v-icon icon="mdi-check-circle-outline" start />
            Matched
          </v-chip>
          <v-chip
            v-else
            class="detected-item-list__chip detected-item-list__chip--unknown"
            size="small"
          >
            <v-icon icon="mdi-help-circle-outline" start />
            Unknown
          </v-chip>
          <span class="detected-item-list__raw">{{ item.rawLabel }}</span>
        </div>
      </div>

      <template #append>
        <v-btn
          :aria-label="`Remove ${item.displayName}`"
          class="detected-item-list__remove"
          icon="mdi-delete-outline"
          size="small"
          variant="tonal"
          @click="emit('remove', item.id)"
        />
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped>
.detected-item-list {
  display: grid;
  gap: var(--space-3);
  background: transparent;
}

.detected-item-list__item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.detected-item-list__item--selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.detected-item-list__item:active {
  transform: scale(0.995);
}

.detected-item-list__body {
  display: grid;
  gap: var(--space-3);
  width: 100%;
  padding-block: var(--space-2);
}

.detected-item-list__fields {
  display: grid;
  gap: var(--space-3);
}

.detected-item-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  color: var(--color-muted);
  font-size: 0.875rem;
}

.detected-item-list__raw {
  min-width: 0;
  overflow-wrap: anywhere;
}

.detected-item-list__chip {
  border: 1px solid transparent;
}

.detected-item-list__chip--accent,
.detected-item-list__chip--matched {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border-color: color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.detected-item-list__chip--unknown {
  color: var(--color-muted);
  background: var(--color-surface-soft);
  border-color: var(--color-border);
}

.detected-item-list__remove {
  color: var(--color-danger) !important;
  background: var(--color-danger-soft) !important;
  border: 1px solid color-mix(in srgb, var(--color-danger) 32%, transparent);
}

.detected-item-list__remove:focus-visible {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

@media (min-width: 760px) {
  .detected-item-list__fields {
    grid-template-columns: minmax(10rem, 1fr) minmax(10rem, 1fr) 7rem 7rem 9rem 11rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .detected-item-list__item:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }
}
</style>
