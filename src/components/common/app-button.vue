<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    color?: string
    variant?: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
    tone?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success'
    icon?: string
    appendIcon?: string
    to?: string
    block?: boolean
    disabled?: boolean
    loading?: boolean
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    color: 'primary',
    variant: 'flat',
    tone: undefined,
    size: 'default',
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const semanticTone = computed(() => {
  if (props.tone) {
    return props.tone
  }

  if (props.color === 'error') {
    return 'danger'
  }

  if (props.color === 'success') {
    return 'success'
  }

  if (props.color === 'accent') {
    return 'accent'
  }

  if (props.color === 'secondary') {
    return 'secondary'
  }

  return 'primary'
})

const semanticVariant = computed(() => (props.tone === 'ghost' ? 'tonal' : props.variant))
const buttonListeners = computed(() =>
  props.to
    ? {}
    : {
        click: (event: MouseEvent) => emit('click', event),
      },
)
</script>

<template>
  <v-btn
    :append-icon="appendIcon"
    :block="block"
    :class="[`app-button--tone-${semanticTone}`, `app-button--variant-${semanticVariant}`]"
    :color="color"
    :disabled="disabled"
    :loading="loading"
    :prepend-icon="icon"
    :size="size"
    :to="to"
    :type="type"
    :variant="semanticVariant"
    v-on="buttonListeners"
    class="app-button"
  >
    <slot />
  </v-btn>
</template>

<style scoped>
.app-button {
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  font-weight: var(--font-weight-bold);
  min-height: 44px;
  padding-inline: var(--space-4);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.app-button :deep(.v-icon) {
  color: currentColor;
  opacity: 1;
}

.app-button--tone-primary.app-button--variant-flat,
.app-button--tone-primary.app-button--variant-elevated {
  color: var(--color-surface) !important;
  background: var(--color-primary) !important;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.app-button--tone-secondary.app-button--variant-flat,
.app-button--tone-secondary.app-button--variant-elevated {
  color: var(--color-text) !important;
  background: var(--color-secondary) !important;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--color-secondary) 20%, transparent);
}

.app-button--tone-accent.app-button--variant-flat,
.app-button--tone-accent.app-button--variant-elevated {
  color: var(--color-text) !important;
  background: var(--color-accent) !important;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.app-button--tone-success.app-button--variant-flat,
.app-button--tone-success.app-button--variant-elevated {
  color: var(--color-surface) !important;
  background: var(--color-success) !important;
}

.app-button--tone-danger.app-button--variant-flat,
.app-button--tone-danger.app-button--variant-elevated {
  color: var(--color-surface) !important;
  background: var(--color-danger) !important;
}

.app-button--variant-tonal.app-button--tone-primary,
.app-button--variant-outlined.app-button--tone-primary {
  color: var(--color-primary-dark) !important;
  background: var(--color-primary-soft) !important;
  border-color: color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.app-button--variant-tonal.app-button--tone-secondary,
.app-button--variant-outlined.app-button--tone-secondary {
  color: var(--color-text) !important;
  background: var(--color-secondary-soft) !important;
  border-color: color-mix(in srgb, var(--color-secondary) 38%, transparent);
}

.app-button--variant-tonal.app-button--tone-accent,
.app-button--variant-outlined.app-button--tone-accent {
  color: var(--color-accent-dark) !important;
  background: var(--color-accent-soft) !important;
  border-color: color-mix(in srgb, var(--color-accent) 38%, transparent);
}

.app-button--variant-tonal.app-button--tone-success,
.app-button--variant-outlined.app-button--tone-success {
  color: var(--color-success) !important;
  background: var(--color-success-soft) !important;
  border-color: color-mix(in srgb, var(--color-success) 32%, transparent);
}

.app-button--variant-tonal.app-button--tone-danger,
.app-button--variant-outlined.app-button--tone-danger {
  color: var(--color-danger) !important;
  background: var(--color-danger-soft) !important;
  border-color: color-mix(in srgb, var(--color-danger) 32%, transparent);
}

.app-button--tone-ghost {
  color: var(--color-primary-dark) !important;
  background: var(--color-surface) !important;
  border-color: var(--color-border);
}

.app-button:active {
  transform: scale(0.98);
}

.app-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: var(--focus-ring);
}

@media (hover: hover) and (pointer: fine) {
  .app-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }

  .app-button--tone-primary.app-button--variant-flat:hover,
  .app-button--tone-primary.app-button--variant-elevated:hover {
    background: var(--color-primary-dark) !important;
  }

  .app-button--tone-ghost:hover {
    background: var(--color-primary-soft) !important;
  }
}

.app-button.v-btn--disabled {
  color: var(--color-disabled) !important;
  background: var(--color-surface-soft) !important;
  border-color: var(--color-border);
  box-shadow: none;
  opacity: 1;
}
</style>
