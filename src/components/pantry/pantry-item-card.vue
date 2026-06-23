<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import FreshnessBadge from '@/components/common/freshness-badge.vue'
import type { FreshnessStatus, PantryItem, StorageLocation } from '@/composables/app-types'
import { formatDisplayDate } from '@/composables/date-utils'
import { storageLocationLabels } from '@/stores/pantry'

const props = defineProps<{
  item?: Partial<PantryItem> | null
}>()

const emit = defineEmits<{
  delete: [id: string]
}>()

function safeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function isStorageLocation(value: unknown): value is StorageLocation {
  return typeof value === 'string' && value in storageLocationLabels
}

const itemId = computed(() => safeText(props.item?.id, ''))
const displayName = computed(() => safeText(props.item?.displayName, 'Unnamed item'))
const itemDescription = computed(() => safeText(props.item?.description, ''))
const quantity = computed(() =>
  typeof props.item?.quantity === 'number' &&
  Number.isFinite(props.item.quantity) &&
  props.item.quantity > 0
    ? props.item.quantity
    : 1,
)
const unit = computed(() => safeText(props.item?.unit, 'item'))
const storageLocation = computed(() =>
  isStorageLocation(props.item?.storageLocation)
    ? storageLocationLabels[props.item.storageLocation]
    : 'unknown',
)
const estimatedUseByDate = computed(() => {
  const dateInput = props.item?.estimatedUseByDate

  return typeof dateInput === 'string' && dateInput.trim()
    ? formatDisplayDate(dateInput)
    : 'Not set'
})
const dateAdded = computed(() => {
  const dateInput = props.item?.addedAt ?? props.item?.createdAt

  return typeof dateInput === 'string' && dateInput.trim()
    ? formatDisplayDate(dateInput)
    : 'Not set'
})
const freshnessStatus = computed<FreshnessStatus | string>(() =>
  safeText(props.item?.freshnessStatus, 'unknown'),
)
const quantityLabel = computed(() => `${quantity.value} ${unit.value}`)
const subtitle = computed(() =>
  itemDescription.value ? `${itemDescription.value} · ${quantityLabel.value}` : quantityLabel.value,
)
const itemRoute = computed(() => (itemId.value ? `/app/pantry/${itemId.value}` : undefined))
const canUseItemActions = computed(() => Boolean(itemId.value))

function deleteItem(): void {
  if (!itemId.value) {
    return
  }

  emit('delete', itemId.value)
}
</script>

<template>
  <v-card class="pantry-item-card" border elevation="0">
    <v-card-item>
      <template #prepend>
        <v-avatar class="pantry-item-card__icon" size="42">
          <v-icon icon="mdi-food-apple-outline" />
        </v-avatar>
      </template>

      <v-card-title class="pantry-item-card__title">{{ displayName }}</v-card-title>
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
    </v-card-item>

    <v-card-text class="pantry-item-card__content">
      <freshness-badge :status="freshnessStatus" />
      <div class="pantry-item-card__meta">
        <span>
          <v-icon icon="mdi-archive-outline" size="small" />
          {{ storageLocation }}
        </span>
        <span>
          <v-icon icon="mdi-calendar-plus-outline" size="small" />
          Added {{ dateAdded }}
        </span>
        <span>
          <v-icon icon="mdi-calendar-clock" size="small" />
          Expiration {{ estimatedUseByDate }}
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="pantry-item-card__actions">
      <app-button
        :disabled="!canUseItemActions"
        :to="itemRoute"
        icon="mdi-eye-outline"
        tone="primary"
        variant="tonal"
      >
        Details
      </app-button>
      <v-btn
        :aria-label="`Delete ${displayName}`"
        class="pantry-item-card__delete"
        :disabled="!canUseItemActions"
        icon="mdi-delete-outline"
        variant="tonal"
        @click="deleteItem"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.pantry-item-card {
  height: 100%;
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.pantry-item-card__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.pantry-item-card__title {
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.25;
}

.pantry-item-card__content {
  display: grid;
  gap: var(--space-3);
}

.pantry-item-card__meta {
  display: grid;
  gap: var(--space-2);
  color: var(--color-muted);
}

.pantry-item-card__meta span {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
}

.pantry-item-card__actions {
  justify-content: space-between;
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

.pantry-item-card__delete {
  color: var(--color-danger) !important;
  background: var(--color-danger-soft) !important;
  border: 1px solid color-mix(in srgb, var(--color-danger) 32%, transparent);
}

.pantry-item-card__delete:active {
  transform: scale(0.96);
}

.pantry-item-card__delete:focus-visible {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .pantry-item-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
    border-color: color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  }
}
</style>
