<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import SourceImageLightbox from '@/components/scanner/source-image-lightbox.vue'

const props = defineProps<{
  imageUrl: string | null
  processedImageUrl?: string | null
  originalSize?: {
    width: number
    height: number
  } | null
  resizedSize?: {
    width: number
    height: number
  } | null
  showDiagnostics?: boolean
}>()

const lightboxOpen = ref(false)
const lightboxMetaItems = computed(() => {
  const items: { label: string; value: string }[] = []

  if (props.originalSize) {
    items.push({
      label: 'Original dimensions',
      value: `${props.originalSize.width}x${props.originalSize.height}`,
    })
  }

  if (props.resizedSize) {
    items.push({
      label: 'Prepared dimensions',
      value: `${props.resizedSize.width}x${props.resizedSize.height}`,
    })
  }

  return items
})
</script>

<template>
  <v-card v-if="imageUrl" class="scan-preview" border elevation="0">
    <v-card-item>
      <template #prepend>
        <v-avatar class="scan-preview__icon" size="40">
          <v-icon icon="mdi-image-outline" />
        </v-avatar>
      </template>
      <v-card-title class="scan-preview__title">Source preview</v-card-title>
      <v-card-subtitle>Check that the item lines are readable before processing.</v-card-subtitle>
    </v-card-item>

    <v-card-text class="scan-preview__content">
      <button
        aria-label="Open source image preview"
        class="scan-preview__image-button"
        type="button"
        @click="lightboxOpen = true"
      >
        <img :src="imageUrl" alt="Uploaded source image preview" class="scan-preview__image" />
      </button>

      <div class="scan-preview__actions">
        <app-button icon="mdi-magnify-plus-outline" tone="ghost" variant="tonal" @click="lightboxOpen = true">
          Review image
        </app-button>
      </div>

      <div v-if="showDiagnostics && (originalSize || resizedSize)" class="scan-preview__meta">
        <v-chip
          v-if="originalSize"
          class="scan-preview__chip scan-preview__chip--warm"
          size="small"
        >
          Original {{ originalSize.width }}×{{ originalSize.height }}
        </v-chip>
        <v-chip
          v-if="resizedSize"
          class="scan-preview__chip scan-preview__chip--accent"
          size="small"
        >
          Prepared {{ resizedSize.width }}×{{ resizedSize.height }}
        </v-chip>
      </div>

      <v-alert
        v-if="showDiagnostics && processedImageUrl"
        class="scan-preview__diagnostic-alert"
        icon="mdi-image-filter-center-focus"
        variant="tonal"
      >
        Prepared scan asset created for diagnostics.
      </v-alert>
    </v-card-text>

    <source-image-lightbox
      v-model="lightboxOpen"
      :image-url="imageUrl"
      :meta-items="lightboxMetaItems"
      subtitle="Current scan source"
      title="Source preview"
    />
  </v-card>
</template>

<style scoped>
.scan-preview {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.scan-preview__title {
  font-size: 1rem;
  font-weight: 750;
}

.scan-preview__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.scan-preview__content {
  display: grid;
  gap: var(--space-4);
}

.scan-preview__image-button {
  display: grid;
  width: 100%;
  min-height: clamp(18rem, 60vh, 32rem);
  max-height: 32rem;
  overflow: hidden;
  padding: var(--space-2);
  cursor: zoom-in;
  background: var(--color-surface-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  place-items: center;
}

.scan-preview__image {
  display: block;
  width: 100%;
  height: 100%;
  max-height: 30rem;
  object-fit: contain;
}

.scan-preview__actions {
  display: flex;
  justify-content: end;
}

.scan-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.scan-preview__chip {
  border: 1px solid transparent;
}

.scan-preview__chip--warm {
  color: var(--color-text);
  background: var(--color-secondary-soft);
  border-color: color-mix(in srgb, var(--color-secondary) 34%, transparent);
}

.scan-preview__chip--accent,
.scan-preview__diagnostic-alert {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}
</style>
