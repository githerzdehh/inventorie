<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import PantryItemCard from '@/components/pantry/pantry-item-card.vue'
import PantrySummaryCard from '@/components/pantry/pantry-summary-card.vue'
import type { FreshnessStatus, PantryItem } from '@/composables/app-types'
import { usePantryStore } from '@/stores/pantry'

interface PantryRenderItem {
  item: Partial<PantryItem>
  renderKey: string
}

interface PantryGroup {
  key: FreshnessStatus
  label: string
  icon: string
  items: PantryRenderItem[]
}

const pantryStore = usePantryStore()
const groupConfig: Array<Omit<PantryGroup, 'items'>> = [
  { key: 'expiring-today', label: 'Expiring Today', icon: 'mdi-calendar-alert' },
  { key: 'use-soon', label: 'Use Soon', icon: 'mdi-clock-outline' },
  { key: 'fresh', label: 'Fresh', icon: 'mdi-leaf' },
  { key: 'past-suggested-date', label: 'Past Suggested Date', icon: 'mdi-alert-circle-outline' },
  { key: 'unknown', label: 'Unknown', icon: 'mdi-help-circle-outline' },
]

function logPantryView(level: 'info' | 'warning' | 'error', message: string, data?: unknown): void {
  const consoleMessage = `[Inventorie][Pantry][${level.toUpperCase()}] ${message}`

  if (level === 'error') {
    console.error(consoleMessage, data ?? {})
  } else if (level === 'warning') {
    console.warn(consoleMessage, data ?? {})
  } else {
    console.info(consoleMessage, data ?? {})
  }
}

function isFreshnessStatus(status: unknown): status is FreshnessStatus {
  return groupConfig.some((group) => group.key === status)
}

function normalizeFreshnessStatus(status: unknown): FreshnessStatus {
  return isFreshnessStatus(status) ? status : 'unknown'
}

function isPantryItemRecord(item: unknown): item is Partial<PantryItem> {
  return Boolean(item) && typeof item === 'object'
}

function makeItemRenderKey(
  item: Partial<PantryItem>,
  fallbackIndex: number,
  seenKeys: Map<string, number>,
): string {
  const id = typeof item.id === 'string' && item.id.trim() ? item.id : ''
  const baseKey = id ? `pantry-item:${id}` : `pantry-item:missing-id-${fallbackIndex}`
  const seenCount = seenKeys.get(baseKey) ?? 0
  seenKeys.set(baseKey, seenCount + 1)

  return seenCount === 0 ? baseKey : `${baseKey}:duplicate-${seenCount}`
}

const safePantryItems = computed<Partial<PantryItem>[]>(() =>
  Array.isArray(pantryStore.items) ? pantryStore.items.filter(isPantryItemRecord) : [],
)

const pantryGroups = computed<PantryGroup[]>(() => {
  const seenKeys = new Map<string, number>()
  const groups = groupConfig.map((group) => ({
    ...group,
    items: [] as PantryRenderItem[],
  }))
  const groupsByKey = new Map(groups.map((group) => [group.key, group]))

  safePantryItems.value.forEach((item, index) => {
    const group = groupsByKey.get(normalizeFreshnessStatus(item.freshnessStatus))

    if (!group) {
      return
    }

    group.items.push({
      item,
      renderKey: makeItemRenderKey(item, index, seenKeys),
    })
  })

  return groups.filter((group) => group.items.length > 0)
})

const hasPantryItems = computed(() => safePantryItems.value.length > 0)
const showGroupedList = computed(() => !pantryStore.isLoading && hasPantryItems.value)
const showEmptyState = computed(() => !pantryStore.isLoading && !hasPantryItems.value)

onMounted(async () => {
  logPantryView('info', 'PantryView mounted.')
  await pantryStore.loadPantryItems()
})

watch(
  pantryGroups,
  (groups) => {
    logPantryView('info', 'Rendered pantry group count.', {
      count: groups.length,
    })
  },
  { flush: 'post' },
)

watch(
  showEmptyState,
  (isDisplayed) => {
    if (isDisplayed) {
      logPantryView('info', 'Empty pantry state displayed.')
    }
  },
  { flush: 'post' },
)
</script>

<template>
  <section class="pantry-view app-page app-stack">
    <div class="pantry-view__header">
      <div class="app-page-heading">
        <h2>Pantry vault</h2>
        <p>Saved grocery items with simple estimated freshness dates.</p>
      </div>
      <app-button class="pantry-view__scan-action" icon="mdi-image-search-outline" to="/app/scan">
        Add from scan
      </app-button>
    </div>

    <v-alert class="pantry-view__notice" icon="mdi-information-outline" variant="tonal">
      Freshness dates are general storage guidelines, not guaranteed safety dates. Always check
      smell, texture, appearance, packaging date, and proper storage conditions.
    </v-alert>

    <v-alert
      v-if="pantryStore.errorMessage"
      color="error"
      icon="mdi-alert-circle-outline"
      variant="tonal"
    >
      {{ pantryStore.errorMessage }}
    </v-alert>

    <div v-show="hasPantryItems" class="pantry-view__summary">
      <pantry-summary-card
        :fresh-count="pantryStore.summary.fresh"
        :past-suggested-date-count="pantryStore.summary.pastSuggestedDate"
        :total-items="pantryStore.summary.total"
        :use-soon-count="pantryStore.summary.useSoon"
      />
    </div>

    <div v-show="pantryStore.isLoading" class="pantry-view__loading">
      <v-progress-circular color="accent" indeterminate />
    </div>

    <div v-show="showGroupedList" class="pantry-view__groups">
      <section v-for="group in pantryGroups" :key="group.key" class="pantry-view__group">
        <div class="pantry-view__group-heading">
          <v-icon :icon="group.icon" size="small" />
          <h3>{{ group.label }}</h3>
        </div>
        <v-row>
          <v-col v-for="groupItem in group.items" :key="groupItem.renderKey" cols="12" sm="6">
            <pantry-item-card :item="groupItem.item" @delete="pantryStore.deletePantryItem" />
          </v-col>
        </v-row>
      </section>
    </div>

    <div v-show="showEmptyState" class="pantry-view__empty">
      <empty-state
        icon="mdi-safe-square-outline"
        title="Your pantry is empty"
        description="Scan a source image to save grocery items and freshness date estimates."
        action-label="New scan"
        action-to="/app/scan"
      />
    </div>
  </section>
</template>

<style scoped>
.pantry-view__header {
  display: grid;
  gap: var(--space-4);
}

.pantry-view__scan-action {
  width: 100%;
}

.pantry-view__notice {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 36%, transparent);
  box-shadow: var(--shadow-xs);
}

.pantry-view__loading {
  display: grid;
  min-height: 10rem;
  place-items: center;
}

.pantry-view__group {
  display: grid;
  gap: var(--space-3);
}

.pantry-view__groups {
  display: grid;
  gap: var(--space-5);
}

.pantry-view__group-heading {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  color: var(--color-primary-dark);
}

.pantry-view__group-heading h3 {
  margin: 0;
  font-size: 1.05rem;
}

@media (min-width: 720px) {
  .pantry-view__header {
    grid-template-columns: 1fr auto;
    align-items: start;
  }

  .pantry-view__scan-action {
    width: auto;
  }
}
</style>
