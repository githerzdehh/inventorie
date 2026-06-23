<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import FreshnessBadge from '@/components/common/freshness-badge.vue'
import SelectMenuField from '@/components/common/select-menu-field.vue'
import type { StorageLocation } from '@/composables/app-types'
import {
  formatDisplayDate,
  formatDisplayDateTime,
  getFreshnessStatus,
} from '@/composables/date-utils'
import {
  formatQuantity,
  getQuantityInputMode,
  quantityUnitOptions,
  validateQuantityInput,
} from '@/composables/quantity-utils'
import { scanInputMethodLabel } from '@/composables/scan-record-utils'
import { mockStorageRules } from '@/mocks/data/mock-storage-rules'
import { useAuthStore } from '@/stores/auth'
import { storageLocationLabels, usePantryStore } from '@/stores/pantry'
import { useScansStore } from '@/stores/scans'

interface PantryItemForm {
  displayName: string
  description: string
  quantity: string
  unit: string
  storageLocation: StorageLocation
  estimatedUseByDate: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pantryStore = usePantryStore()
const scansStore = useScansStore()
const isSaving = ref(false)
const saveMessage = ref<string | null>(null)
const saveErrorMessage = ref<string | null>(null)

const storageLocationItems = (
  Object.entries(storageLocationLabels) as Array<[StorageLocation, string]>
).map(([value, title]) => ({
  value,
  title,
}))

const pantryItem = computed(() => pantryStore.itemById(String(route.params.id)))
const pantryItemDisplayName = computed(() => pantryItem.value?.displayName || 'Unnamed item')
const scanRecord = computed(() => {
  const item = pantryItem.value

  if (!item) {
    return undefined
  }

  if (item.scanRecordId) {
    return scansStore.recordById(item.scanRecordId)
  }

  return item.scanCode ? scansStore.recordByCode(item.scanCode) : undefined
})
const storageRule = computed(
  () =>
    mockStorageRules.find((rule) => rule.ingredientId === pantryItem.value?.ingredientId) ?? null,
)
const quantityValidation = computed(() => validateQuantityInput(form.quantity, form.unit))
const quantityErrorMessage = computed(() => quantityValidation.value.errorMessage)
const sourceLabel = computed(() =>
  pantryItem.value?.source === 'receipt_scan' ? 'Scanned source image' : 'Manual entry',
)
const dateAddedLabel = computed(() =>
  formatDateTime(pantryItem.value?.addedAt ?? pantryItem.value?.createdAt),
)
const scanCodeLabel = computed(
  () => pantryItem.value?.scanCode ?? scanRecord.value?.scanCode ?? 'Not linked',
)
const scanAliasLabel = computed(() => scanRecord.value?.alias ?? 'No alias')
const scanNoteLabel = computed(() => scanRecord.value?.note ?? 'No note')
const scanMethodLabel = computed(() =>
  pantryItem.value?.scanInputMethod || scanRecord.value?.inputMethod
    ? scanInputMethodLabel(pantryItem.value?.scanInputMethod ?? scanRecord.value?.inputMethod)
    : 'Not set',
)
const scannedAtLabel = computed(() =>
  formatDateTime(pantryItem.value?.scannedAt ?? scanRecord.value?.scannedAt),
)
const originalFileNameLabel = computed(
  () => pantryItem.value?.originalFileName ?? scanRecord.value?.originalFileName ?? 'Not available',
)
const rawScanLabel = computed(() => pantryItem.value?.rawScanLabel ?? 'Not available')
const storageGuidanceLabel = computed(
  () => storageRule.value?.notes ?? 'No storage guidance available.',
)
const form = reactive<PantryItemForm>({
  displayName: '',
  description: '',
  quantity: '1',
  unit: 'item',
  storageLocation: 'pantry',
  estimatedUseByDate: '',
})

const previewFreshnessStatus = computed(() =>
  getFreshnessStatus(form.estimatedUseByDate ? new Date(form.estimatedUseByDate) : null),
)

function toDateInputValue(dateInput: string | null): string {
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

function formatDate(dateInput: string | null | undefined): string {
  return dateInput ? formatDisplayDate(dateInput) : 'Not set'
}

function formatDateTime(dateInput: string | null | undefined): string {
  return dateInput ? formatDisplayDateTime(dateInput) : 'Not set'
}

function normalizeStorageLocation(location: unknown): StorageLocation {
  return typeof location === 'string' && location in storageLocationLabels
    ? (location as StorageLocation)
    : 'pantry'
}

function syncForm() {
  if (!pantryItem.value) {
    return
  }

  form.displayName = pantryItem.value.displayName || 'Unnamed item'
  form.description = pantryItem.value.description || ''
  form.quantity = formatQuantity(pantryItem.value.quantity)
  form.unit = pantryItem.value.unit || 'item'
  form.storageLocation = normalizeStorageLocation(pantryItem.value.storageLocation)
  form.estimatedUseByDate = toDateInputValue(pantryItem.value.estimatedUseByDate)
}

async function savePantryItem() {
  if (!pantryItem.value || isSaving.value) {
    return
  }

  isSaving.value = true
  saveMessage.value = null
  saveErrorMessage.value = null

  try {
    const quantityResult = validateQuantityInput(form.quantity, form.unit)

    if (quantityResult.errorMessage || !quantityResult.quantity) {
      saveErrorMessage.value = quantityResult.errorMessage ?? 'Quantity is invalid.'
      return
    }

    await pantryStore.updatePantryItem({
      ...pantryItem.value,
      displayName: form.displayName.trim() || pantryItemDisplayName.value,
      description: form.description.trim() || null,
      quantity: quantityResult.quantity,
      unit: form.unit.trim() || 'item',
      storageLocation: form.storageLocation,
      estimatedUseByDate: fromDateInputValue(form.estimatedUseByDate),
    })

    saveMessage.value = 'Pantry item updated.'
  } catch (error) {
    saveErrorMessage.value =
      error instanceof Error ? error.message : 'Could not update this pantry item.'
  } finally {
    isSaving.value = false
  }
}

async function deletePantryItem() {
  if (!pantryItem.value) {
    return
  }

  await pantryStore.deletePantryItem(pantryItem.value.id)
  await router.push('/app/pantry')
}

onMounted(async () => {
  if (!pantryStore.items.length) {
    await pantryStore.loadPantryItems()
  }

  if (!scansStore.records.length) {
    await scansStore.loadScanRecords()
  }

  syncForm()
})

watch(pantryItem, syncForm)
</script>

<template>
  <section class="pantry-item-view app-page app-stack">
    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/pantry" variant="tonal">
      Back to pantry
    </app-button>

    <v-alert
      v-if="saveMessage"
      class="pantry-item-view__success-alert"
      icon="mdi-check-circle-outline"
      variant="tonal"
    >
      {{ saveMessage }}
    </v-alert>

    <v-alert v-if="saveErrorMessage" color="error" icon="mdi-alert-circle-outline" variant="tonal">
      {{ saveErrorMessage }}
    </v-alert>

    <v-card v-if="pantryItem" class="pantry-item-view__panel" border elevation="0">
      <v-card-item>
        <template #prepend>
          <v-avatar class="pantry-item-view__icon" size="44">
            <v-icon icon="mdi-safe-square-outline" />
          </v-avatar>
        </template>
        <v-card-title>{{ pantryItemDisplayName }}</v-card-title>
        <v-card-subtitle>Pantry item details</v-card-subtitle>
      </v-card-item>

      <v-card-text class="pantry-item-view__content">
        <freshness-badge :status="previewFreshnessStatus" />

        <div class="pantry-item-view__detail-section">
          <h3>Item details</h3>
          <div class="pantry-item-view__detail-grid">
            <div>
              <span>Date added</span>
              <strong>{{ dateAddedLabel }}</strong>
            </div>
            <div>
              <span>Estimated expiration</span>
              <strong>{{ formatDate(pantryItem.estimatedUseByDate) }}</strong>
            </div>
            <div>
              <span>Storage</span>
              <strong>{{ storageLocationLabels[pantryItem.storageLocation] }}</strong>
            </div>
            <div>
              <span>Storage guidance</span>
              <strong>{{ storageGuidanceLabel }}</strong>
            </div>
          </div>
        </div>

        <v-text-field v-model="form.displayName" label="Item name" variant="outlined" />

        <v-text-field v-model="form.description" label="Description" variant="outlined" />

        <div class="pantry-item-view__fields">
          <v-text-field
            v-model="form.quantity"
            :error-messages="quantityErrorMessage ? [quantityErrorMessage] : []"
            :inputmode="getQuantityInputMode(form.unit)"
            label="Quantity"
            type="text"
            variant="outlined"
          />
          <select-menu-field v-model="form.unit" :items="quantityUnitOptions" label="Unit" />
        </div>

        <select-menu-field
          :model-value="form.storageLocation"
          :items="storageLocationItems"
          label="Storage location"
          @update:model-value="form.storageLocation = normalizeStorageLocation($event)"
        />

        <v-text-field
          v-model="form.estimatedUseByDate"
          label="Estimated expiration date"
          type="date"
          variant="outlined"
        />

        <v-divider v-if="authStore.isSuperAdmin" />

        <div v-if="authStore.isSuperAdmin" class="pantry-item-view__detail-section">
          <div class="pantry-item-view__section-heading">
            <h3>Scan details</h3>
            <app-button
              v-if="pantryItem.scanCode || scanRecord"
              icon="mdi-history"
              size="small"
              tone="ghost"
              to="/app/scans"
              variant="tonal"
            >
              View scan history
            </app-button>
          </div>
          <div class="pantry-item-view__detail-grid">
            <div>
              <span>Source</span>
              <strong>{{ sourceLabel }}</strong>
            </div>
            <div>
              <span>Scan code</span>
              <strong>{{ scanCodeLabel }}</strong>
            </div>
            <div>
              <span>Scan alias</span>
              <strong>{{ scanAliasLabel }}</strong>
            </div>
            <div>
              <span>Scan note</span>
              <strong>{{ scanNoteLabel }}</strong>
            </div>
            <div>
              <span>How it was scanned</span>
              <strong>{{ scanMethodLabel }}</strong>
            </div>
            <div>
              <span>When it was scanned</span>
              <strong>{{ scannedAtLabel }}</strong>
            </div>
            <div>
              <span>Original filename</span>
              <strong>{{ originalFileNameLabel }}</strong>
            </div>
            <div>
              <span>Raw detected label</span>
              <strong>{{ rawScanLabel }}</strong>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pantry-item-view__actions">
        <app-button
          :loading="isSaving"
          icon="mdi-content-save-outline"
          tone="primary"
          @click="savePantryItem"
        >
          Save changes
        </app-button>
        <app-button
          icon="mdi-delete-outline"
          tone="danger"
          variant="tonal"
          @click="deletePantryItem"
        >
          Delete item
        </app-button>
      </v-card-actions>
    </v-card>

    <empty-state
      v-else
      icon="mdi-safe-square-outline"
      title="Pantry item not found"
      description="This pantry record is not available in the vault."
      action-label="View pantry"
      action-to="/app/pantry"
    />
  </section>
</template>

<style scoped>
.pantry-item-view__panel {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.pantry-item-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.pantry-item-view__content {
  display: grid;
  gap: var(--space-3);
}

.pantry-item-view__success-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.pantry-item-view__fields {
  display: grid;
  gap: var(--space-3);
}

.pantry-item-view__detail-section {
  display: grid;
  gap: var(--space-3);
}

.pantry-item-view__detail-section h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
}

.pantry-item-view__section-heading {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
}

.pantry-item-view__detail-grid {
  display: grid;
  gap: var(--space-3);
}

.pantry-item-view__detail-grid div {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3);
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.pantry-item-view__detail-grid span {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: var(--font-weight-medium);
}

.pantry-item-view__detail-grid strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.pantry-item-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

@media (min-width: 680px) {
  .pantry-item-view__fields {
    grid-template-columns: 10rem 1fr;
  }

  .pantry-item-view__detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
