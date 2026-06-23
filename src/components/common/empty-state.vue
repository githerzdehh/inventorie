<script setup lang="ts">
import AppButton from './app-button.vue'
import AppCard from './app-card.vue'

defineProps<{
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionTo?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <app-card class="empty-state" tone="soft" :border="true">
    <div class="empty-state__icon">
      <v-icon :icon="icon" size="32" />
    </div>
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <app-button v-if="actionLabel && actionTo" :to="actionTo" icon="mdi-arrow-right">
      {{ actionLabel }}
    </app-button>
    <app-button v-else-if="actionLabel" icon="mdi-plus-circle-outline" @click="emit('action')">
      {{ actionLabel }}
    </app-button>
  </app-card>
</template>

<style scoped>
.empty-state {
  text-align: center;
}

.empty-state :deep(.app-card__content) {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  padding: var(--space-8) var(--space-4);
}

.empty-state__icon {
  display: grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  color: var(--color-primary);
  background:
    radial-gradient(circle at 30% 25%, var(--color-surface) 0 18%, transparent 20%),
    var(--color-primary-soft);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-xs);
}

.empty-state h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.empty-state p {
  max-width: 32rem;
  margin: 0;
  color: var(--color-muted);
}

@media (min-width: 640px) {
  .empty-state :deep(.app-card__content) {
    padding-inline: var(--space-8);
  }
}
</style>
