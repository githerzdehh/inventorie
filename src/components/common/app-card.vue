<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    icon?: string
    elevation?: number | string
    border?: boolean
    tone?: 'surface' | 'soft'
    hoverable?: boolean
  }>(),
  {
    elevation: 0,
    border: true,
    tone: 'surface',
    hoverable: false,
  },
)
</script>

<template>
  <v-card
    class="app-card"
    :class="[`app-card--${tone}`, { 'app-card--hoverable': hoverable }]"
    :elevation="elevation"
    :border="border"
  >
    <v-card-item v-if="title || subtitle || icon">
      <template v-if="icon" #prepend>
        <v-avatar class="app-card__icon" size="44">
          <v-icon :icon="icon" />
        </v-avatar>
      </template>

      <v-card-title v-if="title" class="app-card__title">{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle" class="app-card__subtitle">{{ subtitle }}</v-card-subtitle>
    </v-card-item>

    <v-card-text v-if="$slots.default" class="app-card__content">
      <slot />
    </v-card-text>

    <v-card-actions v-if="$slots.actions" class="app-card__actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.app-card {
  border-radius: var(--radius-md);
  border-color: var(--color-border);
  box-shadow: var(--shadow-xs);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base);
}

.app-card--surface {
  background: var(--color-surface);
}

.app-card--soft {
  background: var(--color-surface-soft);
}

.app-card__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.app-card__title {
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.25;
}

.app-card__subtitle {
  color: var(--color-muted);
  opacity: 1;
}

.app-card__content {
  color: var(--color-text);
}

.app-card__content :deep(p:last-child) {
  margin-bottom: 0;
}

.app-card__actions {
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

.app-card:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-soft);
}

@media (hover: hover) and (pointer: fine) {
  .app-card--hoverable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-soft);
  }
}
</style>
