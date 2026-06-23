<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface MetaItem {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: boolean
  imageUrl: string | null | undefined
  title?: string
  subtitle?: string
  metaItems?: MetaItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const zoom = ref(1)
const rotation = ref(0)

const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`)
const imageStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg) scale(${zoom.value})`,
}))

function closeLightbox() {
  emit('update:modelValue', false)
}

function zoomIn() {
  zoom.value = Math.min(3, Number((zoom.value + 0.25).toFixed(2)))
}

function zoomOut() {
  zoom.value = Math.max(0.5, Number((zoom.value - 0.25).toFixed(2)))
}

function rotateLeft() {
  rotation.value = (rotation.value + 270) % 360
}

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360
}

function resetView() {
  zoom.value = 1
  rotation.value = 0
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      resetView()
    }
  },
)
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    class="source-image-lightbox"
    fullscreen
    scrollable
    @update:model-value="emit('update:modelValue', Boolean($event))"
  >
    <v-card class="source-image-lightbox__card">
      <v-toolbar class="source-image-lightbox__toolbar" color="surface" density="comfortable">
        <v-toolbar-title>
          <span>{{ title || 'Source image' }}</span>
          <small v-if="subtitle">{{ subtitle }}</small>
        </v-toolbar-title>
        <v-btn aria-label="Close image preview" icon="mdi-close" variant="text" @click="closeLightbox" />
      </v-toolbar>

      <v-card-text class="source-image-lightbox__content">
        <div class="source-image-lightbox__controls" aria-label="Image preview controls">
          <v-tooltip text="Zoom out">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                :disabled="zoom <= 0.5"
                aria-label="Zoom out"
                icon="mdi-magnify-minus-outline"
                variant="tonal"
                @click="zoomOut"
              />
            </template>
          </v-tooltip>
          <v-chip class="source-image-lightbox__zoom-chip" size="small">{{ zoomLabel }}</v-chip>
          <v-tooltip text="Zoom in">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                :disabled="zoom >= 3"
                aria-label="Zoom in"
                icon="mdi-magnify-plus-outline"
                variant="tonal"
                @click="zoomIn"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Rotate left">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                aria-label="Rotate left"
                icon="mdi-rotate-left"
                variant="tonal"
                @click="rotateLeft"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Rotate right">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                aria-label="Rotate right"
                icon="mdi-rotate-right"
                variant="tonal"
                @click="rotateRight"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Reset">
            <template #activator="{ props: activatorProps }">
              <v-btn
                v-bind="activatorProps"
                aria-label="Reset image view"
                icon="mdi-restore"
                variant="tonal"
                @click="resetView"
              />
            </template>
          </v-tooltip>
        </div>

        <div class="source-image-lightbox__frame">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :style="imageStyle"
            alt="Selected source image"
            draggable="false"
          />
          <v-alert v-else icon="mdi-image-off-outline" variant="tonal">
            Image preview is not available for this scan.
          </v-alert>
        </div>

        <div v-if="metaItems?.length" class="source-image-lightbox__meta-grid">
          <div v-for="item in metaItems" :key="`${item.label}-${item.value}`">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.source-image-lightbox__card {
  background: var(--color-bg);
}

.source-image-lightbox__toolbar {
  border-bottom: 1px solid var(--color-border);
}

.source-image-lightbox__toolbar :deep(.v-toolbar-title__placeholder) {
  display: grid;
  gap: var(--space-1);
}

.source-image-lightbox__toolbar span {
  font-weight: var(--font-weight-bold);
}

.source-image-lightbox__toolbar small {
  color: var(--color-muted);
  font-size: 0.82rem;
  font-weight: var(--font-weight-medium);
}

.source-image-lightbox__content {
  display: grid;
  gap: var(--space-4);
  min-height: 0;
  padding: var(--space-4);
}

.source-image-lightbox__controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
}

.source-image-lightbox__zoom-chip {
  min-width: 4rem;
  justify-content: center;
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
}

.source-image-lightbox__frame {
  display: grid;
  min-height: min(64vh, 44rem);
  overflow: auto;
  place-items: center;
  padding: var(--space-4);
  background:
    linear-gradient(45deg, color-mix(in srgb, var(--color-border) 46%, transparent) 25%, transparent 25%),
    linear-gradient(-45deg, color-mix(in srgb, var(--color-border) 46%, transparent) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, color-mix(in srgb, var(--color-border) 46%, transparent) 75%),
    linear-gradient(-45deg, transparent 75%, color-mix(in srgb, var(--color-border) 46%, transparent) 75%);
  background-color: var(--color-surface);
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;
  background-size: 20px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.source-image-lightbox__frame img {
  display: block;
  max-width: min(100%, 72rem);
  max-height: 72vh;
  object-fit: contain;
  transform-origin: center;
  transition: transform var(--transition-fast);
  user-select: none;
}

.source-image-lightbox__meta-grid {
  display: grid;
  gap: var(--space-3);
}

.source-image-lightbox__meta-grid div {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.source-image-lightbox__meta-grid span {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: var(--font-weight-medium);
}

.source-image-lightbox__meta-grid strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (min-width: 720px) {
  .source-image-lightbox__meta-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
