<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import DetectedItemList from '@/components/scanner/detected-item-list.vue'
import type { DetectedReceiptItem } from '@/composables/app-types'
import { useAuthStore } from '@/stores/auth'
import { usePantryStore } from '@/stores/pantry'
import { useScannerStore } from '@/stores/scanner'

const router = useRouter()
const authStore = useAuthStore()
const pantryStore = usePantryStore()
const scannerStore = useScannerStore()
const isSaving = ref(false)
const saveErrorMessage = ref<string | null>(null)
const showSaveSnackbar = ref(false)

const selectedItems = computed(() => scannerStore.detectedItems.filter((item) => item.selected))
const emptyStateDescription = computed(() =>
  scannerStore.rawOcrText && authStore.isSuperAdmin
    ? 'Scan completed, but no grocery items were detected. Check the raw scan text below or scan another image.'
    : scannerStore.rawOcrText
      ? 'Scan completed, but no grocery items were detected. Try a clearer source image.'
      : 'Process a source image first, then review the parsed items here.',
)

function updateDetectedItem(id: string, updates: Partial<DetectedReceiptItem>) {
  scannerStore.updateDetectedItem(id, updates)
}

async function saveSelectedItems() {
  if (!selectedItems.value.length || isSaving.value) {
    return
  }

  isSaving.value = true
  saveErrorMessage.value = null

  try {
    const pantryItems = await pantryStore.addDetectedItems(
      scannerStore.detectedItems,
      scannerStore.activeScanRecord,
    )
    await scannerStore.markActiveScanRecordSaved(pantryItems.length)
    showSaveSnackbar.value = true
    scannerStore.clearScannerState()
    window.setTimeout(() => {
      void router.push('/app/pantry')
    }, 700)
  } catch (error) {
    saveErrorMessage.value =
      error instanceof Error ? error.message : 'Could not save selected items to pantry.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="review-items-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Review items</h2>
      <p>Check detected grocery items, correct labels, and save selected items to the pantry.</p>
    </div>

    <v-alert
      v-if="scannerStore.rawOcrText && scannerStore.detectedItems.length"
      class="review-items-view__success-alert"
      icon="mdi-check-circle-outline"
      variant="tonal"
    >
      Scan processed. Review the detected items below before saving.
    </v-alert>

    <v-alert v-if="saveErrorMessage" color="error" icon="mdi-alert-circle-outline" variant="tonal">
      {{ saveErrorMessage }}
    </v-alert>

    <v-card
      v-if="scannerStore.detectedItems.length"
      class="review-items-view__panel"
      border
      elevation="0"
    >
      <v-card-item>
        <template #prepend>
          <v-avatar class="review-items-view__icon" size="44">
            <v-icon icon="mdi-format-list-checks" />
          </v-avatar>
        </template>
        <v-card-title>Detected items</v-card-title>
        <v-card-subtitle>
          {{ selectedItems.length }} of {{ scannerStore.detectedItems.length }} selected
        </v-card-subtitle>
      </v-card-item>

      <v-card-text class="review-items-view__content">
        <detected-item-list
          :items="scannerStore.detectedItems"
          @remove="scannerStore.removeDetectedItem"
          @toggle="scannerStore.toggleDetectedItem"
          @update="updateDetectedItem"
        />

        <v-expansion-panels v-if="authStore.isSuperAdmin" variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon icon="mdi-text-box-search-outline" start />
              Raw scan text
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="review-items-view__ocr-text">{{ scannerStore.rawOcrText }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-card-actions class="review-items-view__actions">
        <app-button
          :disabled="!selectedItems.length"
          :loading="isSaving"
          icon="mdi-safe-square-outline"
          tone="primary"
          @click="saveSelectedItems"
        >
          Save selected to pantry
        </app-button>
        <app-button icon="mdi-image-search-outline" tone="secondary" to="/app/scan" variant="tonal">
          Scan another image
        </app-button>
      </v-card-actions>
    </v-card>

    <empty-state
      v-else
      icon="mdi-image-off-outline"
      title="No detected items"
      :description="emptyStateDescription"
      action-label="Go to scan"
      action-to="/app/scan"
    />

    <v-expansion-panels
      v-if="authStore.isSuperAdmin && scannerStore.rawOcrText && !scannerStore.detectedItems.length"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon icon="mdi-text-box-search-outline" start />
          Raw scan text
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <pre class="review-items-view__ocr-text">{{ scannerStore.rawOcrText }}</pre>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-snackbar v-model="showSaveSnackbar" class="review-items-view__snackbar" timeout="1600">
      <v-icon icon="mdi-check-circle-outline" start />
      Items saved to your vault.
    </v-snackbar>
  </section>
</template>

<style scoped>
.review-items-view__panel {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.review-items-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.review-items-view__content {
  display: grid;
  gap: var(--space-4);
}

.review-items-view__success-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.review-items-view__ocr-text {
  max-height: 18rem;
  margin: 0;
  overflow: auto;
  color: var(--color-text);
  white-space: pre-wrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.72rem;
  line-height: 1.45;
  background: var(--color-terminal-bg);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.review-items-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

.review-items-view__snackbar :deep(.v-snackbar__content) {
  color: var(--color-text);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
  border-radius: var(--radius-lg);
}
</style>
