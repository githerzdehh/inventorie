<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import {
  inventoriePreservedAuthStorageKeys,
  resetInventorieTestData,
  type InventorieTestDataResetResult,
} from '@/composables/useInventorieTestDataReset'
import { useAuthStore } from '@/stores/auth'
import { usePantryStore } from '@/stores/pantry'
import { useScannerStore } from '@/stores/scanner'
import { useScansStore } from '@/stores/scans'

const authStore = useAuthStore()
const pantryStore = usePantryStore()
const scansStore = useScansStore()
const scannerStore = useScannerStore()

const showConfirmDialog = ref(false)
const isResetting = ref(false)
const resetResult = ref<InventorieTestDataResetResult | null>(null)
const errorMessage = ref<string | null>(null)

const pantryCount = computed(() => pantryStore.summary.total)
const scanCount = computed(() => scansStore.records.length)

async function loadCounts() {
  await Promise.all([pantryStore.loadPantryItems(), scansStore.loadScanRecords()])
}

async function confirmReset() {
  if (!authStore.isSuperAdmin || isResetting.value) {
    return
  }

  isResetting.value = true
  errorMessage.value = null
  resetResult.value = null

  try {
    resetResult.value = await resetInventorieTestData()
    scannerStore.clearScannerState()
    await loadCounts()
    showConfirmDialog.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not reset Inventorie test data.'
  } finally {
    isResetting.value = false
  }
}

void loadCounts()
</script>

<template>
  <section class="reset-test-data-view app-page app-stack">
    <div class="reset-test-data-view__hero">
      <v-avatar class="reset-test-data-view__icon" size="48">
        <v-icon icon="mdi-database-refresh-outline" />
      </v-avatar>
      <div>
        <p class="reset-test-data-view__eyebrow">Super Admin</p>
        <h2>Reset test data</h2>
        <p>Clear saved scan and pantry records while keeping login access intact.</p>
      </div>
    </div>

    <v-alert
      v-if="!authStore.isSuperAdmin"
      border="start"
      class="reset-test-data-view__alert"
      type="error"
      variant="tonal"
    >
      Only Super Admin can reset test data.
    </v-alert>

    <v-alert
      v-if="resetResult"
      border="start"
      class="reset-test-data-view__alert"
      type="success"
      variant="tonal"
    >
      Test data reset. Pantry and scan history are now empty.
    </v-alert>

    <v-alert
      v-if="errorMessage"
      border="start"
      class="reset-test-data-view__alert"
      type="error"
      variant="tonal"
    >
      {{ errorMessage }}
    </v-alert>

    <v-card class="reset-test-data-view__panel" border elevation="0">
      <v-card-title>Current test data</v-card-title>
      <v-card-text class="reset-test-data-view__content">
        <div class="reset-test-data-view__stats">
          <div>
            <span>Pantry items</span>
            <strong>{{ pantryCount }}</strong>
          </div>
          <div>
            <span>Scan records</span>
            <strong>{{ scanCount }}</strong>
          </div>
        </div>

        <div class="reset-test-data-view__preserved">
          <h3>Kept during reset</h3>
          <v-chip
            v-for="key in inventoriePreservedAuthStorageKeys"
            :key="key"
            class="reset-test-data-view__chip"
            size="small"
          >
            {{ key }}
          </v-chip>
        </div>
      </v-card-text>
      <v-card-actions class="reset-test-data-view__actions">
        <app-button
          icon="mdi-refresh"
          tone="ghost"
          variant="tonal"
          :disabled="isResetting"
          @click="loadCounts"
        >
          Refresh counts
        </app-button>
        <app-button
          icon="mdi-delete-sweep-outline"
          tone="danger"
          :disabled="!authStore.isSuperAdmin"
          :loading="isResetting"
          @click="showConfirmDialog = true"
        >
          Reset scans and pantry
        </app-button>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="showConfirmDialog" width="min(28rem, 92vw)">
      <v-card class="reset-test-data-view__dialog" border elevation="8">
        <v-card-title>Reset scans and pantry?</v-card-title>
        <v-card-text>
          This clears saved scan records and pantry items only. Users, settings, and your active
          session remain available.
        </v-card-text>
        <v-card-actions class="reset-test-data-view__dialog-actions">
          <app-button
            tone="ghost"
            variant="tonal"
            :disabled="isResetting"
            @click="showConfirmDialog = false"
          >
            Cancel
          </app-button>
          <app-button
            icon="mdi-delete-sweep-outline"
            tone="danger"
            :loading="isResetting"
            @click="confirmReset"
          >
            Reset data
          </app-button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<style scoped>
.reset-test-data-view {
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.reset-test-data-view__hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

.reset-test-data-view__icon {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
}

.reset-test-data-view__eyebrow {
  margin-bottom: var(--space-1);
  color: var(--color-primary-dark);
  font-size: 0.78rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  text-transform: uppercase;
}

.reset-test-data-view__hero h2 {
  margin-bottom: var(--space-2);
  font-size: clamp(1.65rem, 7vw, 2.4rem);
  line-height: 1.05;
}

.reset-test-data-view__hero p:last-child {
  max-width: 34rem;
  margin-bottom: 0;
  color: var(--color-muted);
}

.reset-test-data-view__alert,
.reset-test-data-view__panel {
  border-radius: var(--radius-lg);
}

.reset-test-data-view__content {
  display: grid;
  gap: var(--space-5);
}

.reset-test-data-view__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.reset-test-data-view__stats div {
  display: grid;
  gap: var(--space-2);
  min-height: 7rem;
  align-content: center;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.reset-test-data-view__stats span,
.reset-test-data-view__preserved h3 {
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
}

.reset-test-data-view__stats strong {
  color: var(--color-text);
  font-size: 2rem;
  line-height: 1;
}

.reset-test-data-view__preserved {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.reset-test-data-view__preserved h3 {
  width: 100%;
  margin: 0;
}

.reset-test-data-view__chip {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.reset-test-data-view__actions,
.reset-test-data-view__dialog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-4);
}

.reset-test-data-view__dialog {
  border-radius: var(--radius-lg);
}

@media (max-width: 560px) {
  .reset-test-data-view__hero,
  .reset-test-data-view__stats {
    grid-template-columns: 1fr;
  }

  .reset-test-data-view__actions,
  .reset-test-data-view__dialog-actions {
    justify-content: stretch;
  }

  .reset-test-data-view__actions :deep(.v-btn),
  .reset-test-data-view__dialog-actions :deep(.v-btn) {
    flex: 1 1 100%;
  }
}
</style>
