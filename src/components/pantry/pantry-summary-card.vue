<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    totalItems?: number
    useSoonCount?: number
    freshCount?: number
    pastSuggestedDateCount?: number
  }>(),
  {
    totalItems: 0,
    useSoonCount: 0,
    freshCount: 0,
    pastSuggestedDateCount: 0,
  },
)

function safeCount(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0
}

const summaryCounts = computed(() => ({
  totalItems: safeCount(props.totalItems),
  useSoonCount: safeCount(props.useSoonCount),
  freshCount: safeCount(props.freshCount),
  pastSuggestedDateCount: safeCount(props.pastSuggestedDateCount),
}))
</script>

<template>
  <v-card class="pantry-summary-card" border elevation="0">
    <v-card-text class="pantry-summary-card__grid">
      <div class="pantry-summary-card__metric pantry-summary-card__metric--total">
        <span>Total items</span>
        <strong>{{ summaryCounts.totalItems }}</strong>
      </div>
      <div class="pantry-summary-card__metric pantry-summary-card__metric--soon">
        <span>Use soon</span>
        <strong>{{ summaryCounts.useSoonCount }}</strong>
      </div>
      <div class="pantry-summary-card__metric pantry-summary-card__metric--fresh">
        <span>Fresh</span>
        <strong>{{ summaryCounts.freshCount }}</strong>
      </div>
      <div class="pantry-summary-card__metric pantry-summary-card__metric--past">
        <span>Past suggested date</span>
        <strong>{{ summaryCounts.pastSuggestedDateCount }}</strong>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.pantry-summary-card {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.pantry-summary-card__grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pantry-summary-card__metric {
  display: grid;
  gap: var(--space-1);
  min-height: 5.2rem;
  align-content: center;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.pantry-summary-card__grid span {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.pantry-summary-card__grid strong {
  font-size: 1.35rem;
  line-height: 1.1;
}

.pantry-summary-card__metric--total {
  background: var(--color-primary-soft);
  border-color: color-mix(in srgb, var(--color-primary) 24%, transparent);
}

.pantry-summary-card__metric--soon {
  background: var(--color-warning-soft);
  border-color: color-mix(in srgb, var(--color-warning) 28%, transparent);
}

.pantry-summary-card__metric--fresh {
  background: var(--color-success-soft);
  border-color: color-mix(in srgb, var(--color-success) 26%, transparent);
}

.pantry-summary-card__metric--past {
  background: var(--color-danger-soft);
  border-color: color-mix(in srgb, var(--color-danger) 28%, transparent);
}

@media (min-width: 760px) {
  .pantry-summary-card__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
