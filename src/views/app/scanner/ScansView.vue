<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import SourceImageLightbox from '@/components/scanner/source-image-lightbox.vue'
import type { ScanRecord } from '@/composables/app-types'
import { formatDisplayDateTime } from '@/composables/date-utils'
import { formatImageByteSize } from '@/composables/image-preview-utils'
import { scanInputMethodLabel, scanRecordStatusLabel } from '@/composables/scan-record-utils'
import { useAuthStore } from '@/stores/auth'
import { useScansStore } from '@/stores/scans'

interface ScanDraft {
  alias: string
  note: string
}

const authStore = useAuthStore()
const scansStore = useScansStore()
const scanDrafts = reactive<Record<string, ScanDraft>>({})
const selectedRecordId = ref<string | null>(null)
const lightboxOpen = ref(false)

const hasScanRecords = computed(() => scansStore.records.length > 0)
const selectedRecord = computed(() =>
  selectedRecordId.value ? scansStore.recordById(selectedRecordId.value) : undefined,
)
const detailDialogOpen = computed({
  get: () => Boolean(selectedRecord.value),
  set: (value: boolean) => {
    if (!value) {
      selectedRecordId.value = null
      lightboxOpen.value = false
    }
  },
})
const selectedRecordMetaItems = computed(() =>
  selectedRecord.value ? makeScanMetaItems(selectedRecord.value) : [],
)

function syncDrafts() {
  for (const record of scansStore.records) {
    if (!scanDrafts[record.id]) {
      scanDrafts[record.id] = {
        alias: record.alias,
        note: record.note ?? '',
      }
    }
  }

  for (const recordId of Object.keys(scanDrafts)) {
    if (!scansStore.records.some((record) => record.id === recordId)) {
      delete scanDrafts[recordId]
    }
  }
}

function getDraft(recordId: string): ScanDraft {
  return (
    scanDrafts[recordId] ?? {
      alias: '',
      note: '',
    }
  )
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

function formatDimensions(record: ScanRecord): string {
  return record.imagePreviewWidth && record.imagePreviewHeight
    ? `${record.imagePreviewWidth}x${record.imagePreviewHeight}`
    : 'Not available'
}

function makeScanMetaItems(record: ScanRecord): { label: string; value: string }[] {
  return [
    {
      label: 'Scan code',
      value: record.scanCode,
    },
    {
      label: 'Scanned',
      value: formatDisplayDateTime(record.scannedAt),
    },
    {
      label: 'Method',
      value: scanInputMethodLabel(record.inputMethod),
    },
    {
      label: 'Original file',
      value: record.originalFileName || 'Not available',
    },
    {
      label: 'Preview size',
      value: formatDimensions(record),
    },
    {
      label: 'Stored preview',
      value: formatImageByteSize(record.imagePreviewByteSize),
    },
    {
      label: 'Detected items',
      value: String(record.itemCount),
    },
    {
      label: 'Saved items',
      value: String(record.savedItemCount),
    },
    {
      label: 'OCR confidence',
      value: formatConfidence(record.ocrConfidence),
    },
  ]
}

function openScanDetails(record: ScanRecord) {
  selectedRecordId.value = record.id
}

function openLightbox(record: ScanRecord) {
  selectedRecordId.value = record.id
  lightboxOpen.value = true
}

async function saveScanDetails(recordId: string) {
  const draft = getDraft(recordId)

  await scansStore.updateScanRecord(recordId, {
    alias: draft.alias,
    note: draft.note,
  })
}

onMounted(async () => {
  await scansStore.loadScanRecords()
  syncDrafts()
})

watch(
  () => scansStore.records,
  () => syncDrafts(),
  { deep: true },
)
</script>

<template>
  <section class="scans-view app-page app-stack">
    <div class="scans-view__header">
      <div class="app-page-heading">
        <h2>{{ authStore.isSuperAdmin ? 'Scan history' : 'Scanner' }}</h2>
        <p>
          {{
            authStore.isSuperAdmin
              ? 'Source image scans saved for pantry traceability.'
              : 'Scan records stay in the background while your inventory stays easy to manage.'
          }}
        </p>
      </div>
      <app-button icon="mdi-image-search-outline" tone="primary" to="/app/scan">
        New scan
      </app-button>
    </div>

    <template v-if="authStore.isSuperAdmin">
      <v-alert
        v-if="scansStore.errorMessage"
        color="error"
        icon="mdi-alert-circle-outline"
        variant="tonal"
      >
        {{ scansStore.errorMessage }}
      </v-alert>

      <v-alert
        v-if="scansStore.successMessage"
        class="scans-view__success-alert"
        icon="mdi-check-circle-outline"
        variant="tonal"
      >
        {{ scansStore.successMessage }}
      </v-alert>

      <div v-show="scansStore.isLoading" class="scans-view__loading">
        <v-progress-circular color="accent" indeterminate />
      </div>

      <div v-if="hasScanRecords" class="scans-view__list">
        <v-card
          v-for="record in scansStore.records"
          :key="record.id"
          class="scans-view__record"
          border
          elevation="0"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar class="scans-view__icon" size="44">
                <v-icon icon="mdi-image-search-outline" />
              </v-avatar>
            </template>
            <v-card-title>{{ record.scanCode }}</v-card-title>
            <v-card-subtitle>{{ scanRecordStatusLabel(record.status) }}</v-card-subtitle>
            <template #append>
              <v-chip class="scans-view__method-chip" size="small">
                {{ scanInputMethodLabel(record.inputMethod) }}
              </v-chip>
            </template>
          </v-card-item>

          <v-card-text class="scans-view__content">
            <button
              v-if="record.imagePreviewDataUrl"
              class="scans-view__thumb"
              type="button"
              @click="openLightbox(record)"
            >
              <img :src="record.imagePreviewDataUrl" alt="Stored source image preview" />
            </button>

            <div class="scans-view__meta-grid">
              <div>
                <span>Scanned</span>
                <strong>{{ formatDisplayDateTime(record.scannedAt) }}</strong>
              </div>
              <div>
                <span>Original file</span>
                <strong>{{ record.originalFileName || 'Not available' }}</strong>
              </div>
              <div>
                <span>Detected items</span>
                <strong>{{ record.itemCount }}</strong>
              </div>
              <div>
                <span>Saved items</span>
                <strong>{{ record.savedItemCount }}</strong>
              </div>
              <div>
                <span>OCR confidence</span>
                <strong>{{ formatConfidence(record.ocrConfidence) }}</strong>
              </div>
            </div>

            <div class="scans-view__fields">
              <v-text-field
                :model-value="getDraft(record.id).alias"
                label="Alias"
                variant="outlined"
                @update:model-value="getDraft(record.id).alias = String($event)"
              />
              <v-textarea
                :model-value="getDraft(record.id).note"
                auto-grow
                label="Note"
                rows="2"
                variant="outlined"
                @update:model-value="getDraft(record.id).note = String($event)"
              />
            </div>
          </v-card-text>

          <v-card-actions class="scans-view__actions">
            <app-button icon="mdi-content-save-outline" @click="saveScanDetails(record.id)">
              Save details
            </app-button>
            <app-button
              icon="mdi-information-outline"
              tone="ghost"
              variant="tonal"
              @click="openScanDetails(record)"
            >
              View details
            </app-button>
            <app-button
              v-if="record.imagePreviewDataUrl"
              icon="mdi-magnify-plus-outline"
              tone="ghost"
              variant="tonal"
              @click="openLightbox(record)"
            >
              View image
            </app-button>
          </v-card-actions>
        </v-card>
      </div>

      <empty-state
        v-else-if="!scansStore.isLoading"
        icon="mdi-history"
        title="No scans yet"
        description="Scan a source image to create a traceable scan record."
        action-label="New scan"
        action-to="/app/scan"
      />

      <v-dialog v-model="detailDialogOpen" max-width="920" scrollable>
        <v-card v-if="selectedRecord" class="scans-view__detail-dialog">
          <v-card-item>
            <template #prepend>
              <v-avatar class="scans-view__icon" size="44">
                <v-icon icon="mdi-image-search-outline" />
              </v-avatar>
            </template>
            <v-card-title>{{ selectedRecord.alias }}</v-card-title>
            <v-card-subtitle>{{ selectedRecord.scanCode }}</v-card-subtitle>
            <template #append>
              <v-btn
                aria-label="Close scan details"
                icon="mdi-close"
                variant="text"
                @click="detailDialogOpen = false"
              />
            </template>
          </v-card-item>

          <v-card-text class="scans-view__detail-content">
            <button
              v-if="selectedRecord.imagePreviewDataUrl"
              class="scans-view__detail-preview"
              type="button"
              @click="lightboxOpen = true"
            >
              <img :src="selectedRecord.imagePreviewDataUrl" alt="Stored source image preview" />
            </button>
            <v-alert v-else icon="mdi-image-off-outline" variant="tonal">
              Image preview is not available for this scan.
            </v-alert>

            <div class="scans-view__meta-grid">
              <div v-for="item in selectedRecordMetaItems" :key="`${item.label}-${item.value}`">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="scans-view__actions">
            <app-button
              v-if="selectedRecord.imagePreviewDataUrl"
              icon="mdi-magnify-plus-outline"
              @click="lightboxOpen = true"
            >
              Open image
            </app-button>
            <app-button tone="ghost" variant="tonal" @click="detailDialogOpen = false">
              Close
            </app-button>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <source-image-lightbox
        v-model="lightboxOpen"
        :image-url="selectedRecord?.imagePreviewDataUrl"
        :meta-items="selectedRecordMetaItems"
        :subtitle="selectedRecord?.scanCode"
        :title="selectedRecord?.alias"
      />
    </template>

    <empty-state
      v-else
      icon="mdi-shield-check-outline"
      title="Scan records are managed automatically"
      description="Your inventory keeps scan connections in the background while regular screens stay focused on items, expiration dates, and recipes."
      action-label="Scan items"
      action-to="/app/scan"
    />
  </section>
</template>

<style scoped>
.scans-view__header {
  display: grid;
  gap: var(--space-4);
}

.scans-view__loading {
  display: grid;
  min-height: 10rem;
  place-items: center;
}

.scans-view__list {
  display: grid;
  gap: var(--space-4);
}

.scans-view__record {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.scans-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.scans-view__method-chip,
.scans-view__success-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.scans-view__content {
  display: grid;
  gap: var(--space-4);
}

.scans-view__thumb,
.scans-view__detail-preview {
  display: grid;
  width: 100%;
  overflow: hidden;
  cursor: zoom-in;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  place-items: center;
}

.scans-view__thumb {
  height: 14rem;
  padding: var(--space-2);
}

.scans-view__detail-preview {
  max-height: min(64vh, 36rem);
  padding: var(--space-3);
}

.scans-view__thumb img,
.scans-view__detail-preview img {
  display: block;
  width: 100%;
  height: 100%;
  max-height: inherit;
  object-fit: contain;
}

.scans-view__meta-grid {
  display: grid;
  gap: var(--space-3);
}

.scans-view__meta-grid div {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.scans-view__meta-grid span {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: var(--font-weight-medium);
}

.scans-view__meta-grid strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.scans-view__fields {
  display: grid;
  gap: var(--space-3);
}

.scans-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

.scans-view__detail-dialog {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
}

.scans-view__detail-content {
  display: grid;
  gap: var(--space-4);
}

@media (min-width: 720px) {
  .scans-view__header {
    grid-template-columns: 1fr auto;
    align-items: start;
  }

  .scans-view__meta-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
