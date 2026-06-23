<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import type { ScanInputMethod } from '@/composables/app-types'

defineProps<{
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [file: File | null, inputMethod: ScanInputMethod]
}>()

const selectedFile = ref<File | File[] | null>(null)
const errorMessage = ref<string | null>(null)
const captureInput = ref<HTMLInputElement | null>(null)

const selectedImage = computed(() => {
  const value = selectedFile.value

  return Array.isArray(value) ? (value[0] ?? null) : value
})

const selectedFileSize = computed(() => {
  if (!selectedImage.value) {
    return null
  }

  return `${(selectedImage.value.size / 1024 / 1024).toFixed(2)} MB`
})

function handleFileUpdate(value: File | File[] | null, inputMethod: ScanInputMethod = 'upload') {
  selectedFile.value = value
  errorMessage.value = null

  const file = Array.isArray(value) ? (value[0] ?? null) : value

  if (!file) {
    emit('select', null, inputMethod)
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Choose an image file from your device.'
    selectedFile.value = null
    emit('select', null, inputMethod)
    return
  }

  emit('select', file, inputMethod)
}

function openCaptureInput() {
  captureInput.value?.click()
}

function handleCaptureUpdate(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  handleFileUpdate(file, 'capture')
  input.value = ''
}
</script>

<template>
  <v-card class="receipt-uploader" border elevation="0">
    <v-card-text class="receipt-uploader__content">
      <div class="receipt-uploader__heading">
        <div class="receipt-uploader__icon">
          <v-icon icon="mdi-image-outline" size="34" />
        </div>
        <div>
          <h3>Source image</h3>
          <p>Use a clear, well-lit grocery image. Cropped images process faster.</p>
        </div>
      </div>

      <v-file-input
        :disabled="disabled"
        :error-messages="errorMessage ? [errorMessage] : []"
        :model-value="selectedFile"
        accept="image/*"
        clearable
        label="Upload source image"
        prepend-icon=""
        prepend-inner-icon="mdi-camera-outline"
        variant="outlined"
        @update:model-value="handleFileUpdate($event, 'upload')"
      />

      <v-alert
        v-if="selectedImage"
        class="receipt-uploader__selected-alert"
        icon="mdi-image-check-outline"
        variant="tonal"
      >
        {{ selectedImage.name }}<span v-if="selectedFileSize"> · {{ selectedFileSize }}</span>
      </v-alert>

      <input
        ref="captureInput"
        accept="image/*"
        capture="environment"
        class="receipt-uploader__capture-input"
        type="file"
        @change="handleCaptureUpdate"
      />

      <app-button
        :disabled="disabled"
        :loading="loading"
        block
        icon="mdi-camera-outline"
        size="large"
        tone="accent"
        variant="tonal"
        @click="openCaptureInput"
      >
        Capture with camera
      </app-button>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.receipt-uploader {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.receipt-uploader__content {
  display: grid;
  gap: var(--space-4);
}

.receipt-uploader__heading {
  display: grid;
  gap: var(--space-3);
  align-items: center;
}

.receipt-uploader__icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: var(--radius-pill);
}

.receipt-uploader__heading h3 {
  margin: 0 0 var(--space-1);
  font-size: 1.05rem;
}

.receipt-uploader__heading p {
  margin: 0;
  color: var(--color-muted);
}

.receipt-uploader__selected-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.receipt-uploader__capture-input {
  position: fixed;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

@media (hover: hover) and (pointer: fine) {
  .receipt-uploader:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }
}

@media (min-width: 640px) {
  .receipt-uploader__heading {
    grid-template-columns: auto 1fr;
  }
}
</style>
