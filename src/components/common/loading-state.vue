<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
  }>(),
  {
    label: 'Loading',
  },
)
</script>

<template>
  <v-sheet class="loading-state" rounded="lg">
    <v-progress-circular color="accent" indeterminate size="32" width="4" />
    <span>{{ label }}</span>
  </v-sheet>
</template>

<style scoped>
.loading-state {
  display: inline-flex;
  gap: var(--space-3);
  align-items: center;
  justify-content: center;
  min-height: 5rem;
  padding: var(--space-5);
  color: var(--color-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.loading-state span {
  font-weight: var(--font-weight-medium);
}
</style>
