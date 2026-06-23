<script setup lang="ts">
import { computed } from 'vue'
import type { FreshnessStatus } from '@/composables/app-types'

const props = defineProps<{
  status?: FreshnessStatus | string | null
}>()

const freshnessConfig: Record<
  FreshnessStatus,
  {
    label: string
    tone: 'success' | 'warning' | 'danger' | 'neutral'
    icon: string
  }
> = {
  fresh: {
    label: 'Fresh',
    tone: 'success',
    icon: 'mdi-leaf',
  },
  'use-soon': {
    label: 'Use Soon',
    tone: 'warning',
    icon: 'mdi-clock-outline',
  },
  'expiring-today': {
    label: 'Expiring Today',
    tone: 'danger',
    icon: 'mdi-calendar-alert',
  },
  'past-suggested-date': {
    label: 'Past Suggested Date',
    tone: 'danger',
    icon: 'mdi-alert-circle-outline',
  },
  unknown: {
    label: 'Unknown',
    tone: 'neutral',
    icon: 'mdi-help-circle-outline',
  },
}

function isFreshnessStatus(status: unknown): status is FreshnessStatus {
  return typeof status === 'string' && status in freshnessConfig
}

const badge = computed(
  () => freshnessConfig[isFreshnessStatus(props.status) ? props.status : 'unknown'],
)
</script>

<template>
  <v-chip
    :aria-label="badge.label"
    class="freshness-badge"
    :class="`freshness-badge--${badge.tone}`"
    size="small"
  >
    <v-icon :icon="badge.icon" start />
    {{ badge.label }}
  </v-chip>
</template>

<style scoped>
.freshness-badge {
  border: 1px solid transparent;
  font-weight: var(--font-weight-bold);
}

.freshness-badge--success {
  color: var(--color-success);
  background: var(--color-success-soft);
  border-color: color-mix(in srgb, var(--color-success) 24%, transparent);
}

.freshness-badge--warning {
  color: var(--color-text);
  background: var(--color-warning-soft);
  border-color: color-mix(in srgb, var(--color-warning) 28%, transparent);
}

.freshness-badge--danger {
  color: var(--color-danger);
  background: var(--color-danger-soft);
  border-color: color-mix(in srgb, var(--color-danger) 24%, transparent);
}

.freshness-badge--neutral {
  color: var(--color-muted);
  background: var(--color-surface-soft);
  border-color: var(--color-border);
}
</style>
