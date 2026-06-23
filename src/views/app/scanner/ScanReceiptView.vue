<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import ReceiptUploader from '@/components/scanner/receipt-uploader.vue'
import ScanPreview from '@/components/scanner/scan-preview.vue'
import type { ScanInputMethod } from '@/composables/app-types'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'

const router = useRouter()
const authStore = useAuthStore()
const scannerStore = useScannerStore()
const elapsedTick = ref(0)
let elapsedTimer: number | null = null

const canProcessReceipt = computed(
  () => Boolean(scannerStore.uploadedFile) && !scannerStore.isProcessing,
)
const canContinueToReview = computed(
  () => scannerStore.detectedItems.length > 0 && !scannerStore.isProcessing,
)
const progressPercent = computed(() => Math.round(scannerStore.ocrProgress * 100))
const displayElapsedMs = computed(() => {
  elapsedTick.value

  if (scannerStore.isProcessing && scannerStore.startedAt) {
    return Date.now() - new Date(scannerStore.startedAt).getTime()
  }

  return scannerStore.elapsedMs
})
const formattedElapsed = computed(() => {
  const seconds = Math.max(0, Math.round(displayElapsedMs.value / 1000))
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return minutes ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`
})
const resultAlertIcon = computed(() =>
  scannerStore.detectedItems.length ? 'mdi-check-circle-outline' : 'mdi-alert-outline',
)
const publicScanStep = computed(() => {
  if (!scannerStore.uploadedFile && !scannerStore.rawOcrText) {
    return 'Waiting for image'
  }

  if (scannerStore.isProcessing) {
    if (scannerStore.ocrProgress < 0.2) {
      return 'Preparing image'
    }

    if (scannerStore.ocrProgress < 0.9) {
      return 'Reading image'
    }

    return 'Reviewing items'
  }

  if (scannerStore.detectedItems.length) {
    return 'Ready for review'
  }

  return scannerStore.uploadedFile ? 'Ready to scan' : 'Scan complete'
})
const diagnosticTerminalLines = computed(() => {
  const latestEvent = scannerStore.debugEvents[0]
  const lines = [
    `status=${scannerStore.ocrStatus}`,
    `step=${scannerStore.ocrStep}`,
    `progress=${progressPercent.value}% elapsed=${formattedElapsed.value}`,
  ]

  if (latestEvent) {
    lines.push(`last=${latestEvent.level}:${latestEvent.step}`)
  }

  return lines
})
const scannerStatusLabel = computed(() =>
  authStore.isSuperAdmin ? scannerStore.ocrStatus : publicScanStep.value,
)

function handleReceiptSelected(file: File | null, inputMethod: ScanInputMethod) {
  scannerStore.setUploadedImage(file, {
    diagnosticsEnabled: authStore.isSuperAdmin,
    inputMethod,
  })
}

async function processReceipt() {
  await scannerStore.processReceipt(null, {
    diagnosticsEnabled: authStore.isSuperAdmin,
  })
}

async function continueToReview() {
  if (!canContinueToReview.value) {
    return
  }

  await router.push('/app/review-items')
}

async function useSampleReceipt() {
  scannerStore.setDiagnosticsEnabled(authStore.isSuperAdmin)
  await scannerStore.loadSampleReceipt()
  await router.push('/app/review-items')
}

function formatDebugData(data: unknown): string {
  if (!data) {
    return ''
  }

  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

watch(
  () => scannerStore.isProcessing,
  (isProcessing) => {
    if (elapsedTimer) {
      window.clearInterval(elapsedTimer)
      elapsedTimer = null
    }

    if (isProcessing) {
      elapsedTimer = window.setInterval(() => {
        elapsedTick.value += 1
      }, 1000)
    }
  },
)

watch(
  () => authStore.isSuperAdmin,
  (isSuperAdmin) => {
    scannerStore.setDiagnosticsEnabled(isSuperAdmin)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (elapsedTimer) {
    window.clearInterval(elapsedTimer)
  }
})
</script>

<template>
  <section class="scan-receipt-view app-page app-stack">
    <div class="scan-receipt-view__hero">
      <div class="app-page-heading">
        <v-chip class="scan-receipt-view__eyebrow" color="primary" size="small" variant="tonal">
          <v-icon icon="mdi-image-search-outline" start />
          Source scanner
        </v-chip>
        <h2>Scan source image</h2>
        <p>Capture or upload a clear grocery image, then review detected items before saving.</p>
      </div>

      <div class="scan-receipt-view__hero-actions">
        <app-button
          v-if="authStore.isSuperAdmin"
          icon="mdi-history"
          tone="ghost"
          to="/app/scans"
          variant="tonal"
        >
          Scan history
        </app-button>
        <app-button
          v-if="authStore.isSuperAdmin"
          :disabled="scannerStore.isProcessing"
          icon="mdi-flask-outline"
          tone="accent"
          variant="tonal"
          @click="useSampleReceipt"
        >
          Use Sample Scan
        </app-button>
      </div>
    </div>

    <receipt-uploader
      :disabled="scannerStore.isProcessing"
      :loading="scannerStore.isProcessing"
      @select="handleReceiptSelected"
    />

    <scan-preview
      :image-url="scannerStore.uploadedImageUrl"
      :original-size="scannerStore.originalImageSize"
      :processed-image-url="scannerStore.processedImageUrl"
      :resized-size="scannerStore.ocrImageSize"
      :show-diagnostics="authStore.isSuperAdmin"
    />

    <v-card class="scan-receipt-view__scanner-card" border elevation="0">
      <v-card-text class="scan-receipt-view__scanner-content">
        <div class="scan-receipt-view__scanner-heading">
          <div>
            <h3>Image scan</h3>
            <p>{{ scannerStatusLabel }}</p>
          </div>
          <v-chip class="scan-receipt-view__progress-chip" size="small">
            {{ progressPercent }}%
          </v-chip>
        </div>

        <v-progress-linear :model-value="progressPercent" color="accent" height="10" rounded />

        <div class="scan-receipt-view__status-grid">
          <v-chip class="scan-receipt-view__status-chip" variant="tonal">
            <v-icon icon="mdi-timer-outline" start />
            {{ formattedElapsed }}
          </v-chip>
          <v-chip color="accent" variant="tonal">
            <v-icon icon="mdi-map-marker-path" start />
            {{ publicScanStep }}
          </v-chip>
          <v-chip
            v-if="authStore.isSuperAdmin && scannerStore.rawOcrText"
            class="scan-receipt-view__status-chip scan-receipt-view__status-chip--warm"
            variant="tonal"
          >
            <v-icon icon="mdi-percent-outline" start />
            {{ Math.round(scannerStore.ocrConfidence * 100) }}% confidence
          </v-chip>
          <v-chip
            v-if="scannerStore.rawOcrText"
            class="scan-receipt-view__status-chip scan-receipt-view__status-chip--accent"
            variant="tonal"
          >
            <v-icon icon="mdi-format-list-checks" start />
            {{ scannerStore.detectedItems.length }} detected
          </v-chip>
        </div>

        <v-alert
          v-if="scannerStore.errorMessage"
          color="error"
          icon="mdi-alert-circle-outline"
          variant="tonal"
        >
          {{ scannerStore.errorMessage }}
        </v-alert>

        <v-alert
          v-if="scannerStore.successMessage"
          class="scan-receipt-view__result-alert"
          :class="{
            'scan-receipt-view__result-alert--empty': !scannerStore.detectedItems.length,
          }"
          :icon="resultAlertIcon"
          variant="tonal"
        >
          {{ scannerStore.successMessage }}
        </v-alert>

        <div class="scan-receipt-view__actions">
          <app-button
            :disabled="!canProcessReceipt"
            :loading="scannerStore.isProcessing"
            block
            icon="mdi-image-search-outline"
            size="x-large"
            tone="primary"
            @click="processReceipt"
          >
            Scan image
          </app-button>

          <app-button
            :disabled="!canContinueToReview"
            block
            icon="mdi-arrow-right-circle-outline"
            size="large"
            tone="accent"
            variant="tonal"
            @click="continueToReview"
          >
            Continue to Review Items
          </app-button>

          <app-button
            :disabled="scannerStore.isProcessing || !scannerStore.uploadedImageUrl"
            block
            icon="mdi-close-circle-outline"
            tone="ghost"
            variant="tonal"
            @click="scannerStore.clearScannerState()"
          >
            Clear
          </app-button>
        </div>
      </v-card-text>
    </v-card>

    <v-expansion-panels
      v-if="authStore.isSuperAdmin && (scannerStore.rawOcrText || scannerStore.debugEvents.length)"
    >
      <v-expansion-panel v-if="scannerStore.rawOcrText">
        <v-expansion-panel-title>
          <v-icon icon="mdi-text-box-search-outline" start />
          Raw scan text
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <pre class="scan-receipt-view__ocr-text">{{ scannerStore.rawOcrText }}</pre>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel v-if="scannerStore.debugEvents.length">
        <v-expansion-panel-title>
          <v-icon icon="mdi-timeline-text-outline" start />
          Scanner diagnostics
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-list class="scan-receipt-view__timeline" lines="three">
            <v-list-item v-for="event in scannerStore.debugEvents" :key="event.id">
              <template #prepend>
                <v-icon
                  :color="
                    event.level === 'error'
                      ? 'error'
                      : event.level === 'warning'
                        ? 'warning'
                        : 'primary'
                  "
                  :icon="
                    event.level === 'error'
                      ? 'mdi-alert-circle-outline'
                      : event.level === 'warning'
                        ? 'mdi-alert-outline'
                        : event.level === 'success'
                          ? 'mdi-check-circle-outline'
                          : 'mdi-information-outline'
                  "
                />
              </template>
              <v-list-item-title>{{ event.message }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ new Date(event.timestamp).toLocaleTimeString() }} · {{ event.step }}
              </v-list-item-subtitle>
              <pre v-if="event.data" class="scan-receipt-view__debug-data">{{
                formatDebugData(event.data)
              }}</pre>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog :model-value="scannerStore.isProcessing" persistent width="min(28rem, 92vw)">
      <v-card class="scan-receipt-view__processing" border elevation="8">
        <v-card-text>
          <div class="scan-receipt-view__processing-content">
            <v-progress-circular color="accent" indeterminate size="58" width="6" />
            <div>
              <h3>Scanning image</h3>
              <p>Keep this screen open until your scan is ready for review.</p>
            </div>
            <v-progress-linear :model-value="progressPercent" color="accent" height="10" rounded />
            <span>{{ progressPercent }}% · {{ formattedElapsed }} · {{ publicScanStep }}</span>
            <pre v-if="authStore.isSuperAdmin" class="scan-receipt-view__processing-terminal">{{
              diagnosticTerminalLines.join('\n')
            }}</pre>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<style scoped>
.scan-receipt-view__hero {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-5);
  background: linear-gradient(145deg, var(--color-surface) 0%, var(--color-primary-soft) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.scan-receipt-view__eyebrow {
  width: fit-content;
}

.scan-receipt-view__hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.scan-receipt-view__scanner-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.scan-receipt-view__scanner-card:focus-within {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-soft);
}

.scan-receipt-view__scanner-content {
  display: grid;
  gap: var(--space-4);
}

.scan-receipt-view__scanner-heading {
  display: flex;
  gap: var(--space-3);
  align-items: start;
  justify-content: space-between;
}

.scan-receipt-view__scanner-heading h3 {
  margin: 0 0 var(--space-1);
  font-size: 1.15rem;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.scan-receipt-view__scanner-heading p {
  margin: 0;
  color: var(--color-muted);
}

.scan-receipt-view__status-grid,
.scan-receipt-view__actions {
  display: grid;
  gap: var(--space-3);
}

.scan-receipt-view__progress-chip {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 32%, transparent);
}

.scan-receipt-view__status-chip {
  color: var(--color-text);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 28%, transparent);
}

.scan-receipt-view__status-chip--accent {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border-color: color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.scan-receipt-view__status-chip--warm {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border-color: color-mix(in srgb, var(--color-secondary) 36%, transparent);
}

.scan-receipt-view__result-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.scan-receipt-view__result-alert--empty {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border-color: color-mix(in srgb, var(--color-secondary) 36%, transparent);
}

.scan-receipt-view__ocr-text,
.scan-receipt-view__debug-data {
  margin: 0;
  overflow: auto;
  color: var(--color-text);
  white-space: pre-wrap;
}

.scan-receipt-view__ocr-text {
  max-height: 18rem;
}

.scan-receipt-view__debug-data {
  max-height: 8rem;
  margin-top: var(--space-2);
  color: var(--color-muted);
  font-size: 0.78rem;
}

.scan-receipt-view__timeline {
  max-height: 26rem;
  overflow: auto;
  background: transparent;
}

.scan-receipt-view__processing {
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
}

.scan-receipt-view__processing-content {
  display: grid;
  gap: var(--space-4);
  justify-items: center;
  padding: var(--space-4);
  text-align: center;
}

.scan-receipt-view__processing-content h3 {
  margin: 0 0 var(--space-2);
}

.scan-receipt-view__processing-content p,
.scan-receipt-view__processing-content span {
  margin: 0;
  color: var(--color-muted);
}

.scan-receipt-view__processing-terminal {
  width: 100%;
  max-height: 5.5rem;
  padding: var(--space-2);
  margin: 0;
  overflow: auto;
  color: var(--color-terminal-text);
  text-align: left;
  white-space: pre-wrap;
  background: var(--color-terminal-bg);
  border-radius: var(--radius-sm);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 0.68rem;
  line-height: 1.35;
}

@media (hover: hover) and (pointer: fine) {
  .scan-receipt-view__scanner-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
  }
}

@media (min-width: 720px) {
  .scan-receipt-view__hero {
    grid-template-columns: 1fr auto;
    align-items: start;
  }

  .scan-receipt-view__hero-actions {
    justify-content: end;
  }

  .scan-receipt-view__status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scan-receipt-view__actions {
    grid-template-columns: minmax(12rem, 1fr) minmax(12rem, 1fr) auto;
  }
}
</style>
