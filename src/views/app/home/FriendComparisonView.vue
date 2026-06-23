<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { mockComparisonProfiles, type MockComparisonProfile } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

type ComparisonWinner = 'current' | 'compared' | 'tie'

interface ComparisonMetric {
  id: 'saved' | 'wasted' | 'donated' | 'recipes' | 'streak' | 'value' | 'weight'
  icon: string
  title: string
  description: string
  currentValue: number
  comparedValue: number
  currentDisplay: string
  comparedDisplay: string
  lowerIsBetter?: boolean
}

interface ComparisonMetricResult extends ComparisonMetric {
  winner: ComparisonWinner
  resultText: string
}

const authStore = useAuthStore()
const appStore = useAppStore()
appStore.initializePreferences()

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

function getFallbackProfile(): MockComparisonProfile {
  const profile = mockComparisonProfiles[0]

  if (!profile) {
    throw new Error('Friend comparison needs at least one profile.')
  }

  return profile
}

const currentProfile = computed(
  () =>
    mockComparisonProfiles.find((profile) => profile.id === authStore.currentUser?.id) ??
    getFallbackProfile(),
)
const comparedProfile = computed(
  () =>
    mockComparisonProfiles.find((profile) => profile.id !== currentProfile.value.id) ??
    currentProfile.value,
)

const savedActions = computed(() => ({
  current: currentProfile.value.savedCount + currentProfile.value.donatedCount,
  compared: comparedProfile.value.savedCount + comparedProfile.value.donatedCount,
}))

const savedActionsLeader = computed<ComparisonWinner>(() => {
  if (savedActions.value.current === savedActions.value.compared) {
    return 'tie'
  }

  return savedActions.value.current > savedActions.value.compared ? 'current' : 'compared'
})

const savedActionsLeadText = computed(() => {
  if (savedActionsLeader.value === 'tie') {
    return `${currentProfile.value.displayName} and ${comparedProfile.value.displayName} are tied on saved actions.`
  }

  const leaderName = getWinnerName(savedActionsLeader.value)
  const difference = Math.abs(savedActions.value.current - savedActions.value.compared)

  return `${leaderName} is ahead by ${formatItems(difference)} saved or shared before expiry.`
})

const comparisonMetrics = computed<ComparisonMetric[]>(() => [
  {
    id: 'saved',
    icon: 'mdi-food-apple-outline',
    title: 'Who saved the most?',
    description: 'Food used before expiry or kept fresh through planned meals.',
    currentValue: currentProfile.value.savedCount,
    comparedValue: comparedProfile.value.savedCount,
    currentDisplay: formatItems(currentProfile.value.savedCount),
    comparedDisplay: formatItems(comparedProfile.value.savedCount),
  },
  {
    id: 'wasted',
    icon: 'mdi-delete-alert-outline',
    title: 'Who wasted the least?',
    description: 'Expired food that was thrown out this week.',
    currentValue: currentProfile.value.wastedCount,
    comparedValue: comparedProfile.value.wastedCount,
    currentDisplay: formatItems(currentProfile.value.wastedCount),
    comparedDisplay: formatItems(comparedProfile.value.wastedCount),
    lowerIsBetter: true,
  },
  {
    id: 'donated',
    icon: 'mdi-hand-heart-outline',
    title: 'Who shared more?',
    description: 'Extra food shared or donated while still usable.',
    currentValue: currentProfile.value.donatedCount,
    comparedValue: comparedProfile.value.donatedCount,
    currentDisplay: formatItems(currentProfile.value.donatedCount),
    comparedDisplay: formatItems(comparedProfile.value.donatedCount),
  },
  {
    id: 'recipes',
    icon: 'mdi-chef-hat',
    title: 'Who cooked from inventory?',
    description: 'Recipes made from items already in the inventory.',
    currentValue: currentProfile.value.recipeCount,
    comparedValue: comparedProfile.value.recipeCount,
    currentDisplay: formatRecipes(currentProfile.value.recipeCount),
    comparedDisplay: formatRecipes(comparedProfile.value.recipeCount),
  },
  {
    id: 'streak',
    icon: 'mdi-calendar-check-outline',
    title: 'Longest no-waste streak',
    description: 'Consecutive days without letting tracked food expire.',
    currentValue: currentProfile.value.noWasteStreakDays,
    comparedValue: comparedProfile.value.noWasteStreakDays,
    currentDisplay: formatDays(currentProfile.value.noWasteStreakDays),
    comparedDisplay: formatDays(comparedProfile.value.noWasteStreakDays),
  },
  {
    id: 'value',
    icon: 'mdi-cash-multiple',
    title: 'Most grocery value protected',
    description: 'Estimated money kept from going to waste.',
    currentValue: currentProfile.value.savedValuePhp,
    comparedValue: comparedProfile.value.savedValuePhp,
    currentDisplay: formatCurrency(currentProfile.value.savedValuePhp),
    comparedDisplay: formatCurrency(comparedProfile.value.savedValuePhp),
  },
  {
    id: 'weight',
    icon: 'mdi-scale-balance',
    title: 'Most waste avoided',
    description: 'Estimated food weight kept in meals, sharing, or storage.',
    currentValue: currentProfile.value.wasteAvoidedKg,
    comparedValue: comparedProfile.value.wasteAvoidedKg,
    currentDisplay: formatKilograms(currentProfile.value.wasteAvoidedKg),
    comparedDisplay: formatKilograms(comparedProfile.value.wasteAvoidedKg),
  },
])

const comparisonResults = computed<ComparisonMetricResult[]>(() =>
  comparisonMetrics.value.map((metric) => {
    const winner = getMetricWinner(metric)

    return {
      ...metric,
      winner,
      resultText: makeResultText(metric, winner),
    }
  }),
)

const savedMostResult = computed(
  () =>
    comparisonResults.value.find((metric) => metric.id === 'saved') ?? comparisonResults.value[0],
)

const savedMostHeadline = computed(() => {
  const result = savedMostResult.value

  if (!result || result.winner === 'tie') {
    return `${currentProfile.value.displayName} and ${comparedProfile.value.displayName} saved the same amount.`
  }

  return `${getWinnerName(result.winner)} saved the most food this week.`
})

function formatItems(value: number): string {
  return `${value} ${value === 1 ? 'item' : 'items'}`
}

function formatRecipes(value: number): string {
  return `${value} ${value === 1 ? 'recipe' : 'recipes'}`
}

function formatDays(value: number): string {
  return `${value} ${value === 1 ? 'day' : 'days'}`
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function formatKilograms(value: number): string {
  return `${value.toFixed(1)} kg`
}

function getMetricWinner(metric: ComparisonMetric): ComparisonWinner {
  if (metric.currentValue === metric.comparedValue) {
    return 'tie'
  }

  const currentWins = metric.lowerIsBetter
    ? metric.currentValue < metric.comparedValue
    : metric.currentValue > metric.comparedValue

  return currentWins ? 'current' : 'compared'
}

function getWinnerName(winner: ComparisonWinner): string {
  if (winner === 'current') {
    return currentProfile.value.displayName
  }

  if (winner === 'compared') {
    return comparedProfile.value.displayName
  }

  return 'Both friends'
}

function makeResultText(metric: ComparisonMetric, winner: ComparisonWinner): string {
  if (winner === 'tie') {
    return `${currentProfile.value.displayName} and ${comparedProfile.value.displayName} are tied here.`
  }

  const winnerName = getWinnerName(winner)
  const difference = Math.abs(metric.currentValue - metric.comparedValue)

  switch (metric.id) {
    case 'saved':
      return `${winnerName} saved ${formatItems(difference)} more this week.`
    case 'wasted':
      return `${winnerName} wasted ${formatItems(difference)} fewer.`
    case 'donated':
      return `${winnerName} shared ${formatItems(difference)} more with friends or neighbors.`
    case 'recipes':
      return `${winnerName} cooked ${formatRecipes(difference)} more from inventory.`
    case 'streak':
      return `${winnerName} kept a no-waste streak ${formatDays(difference)} longer.`
    case 'value':
      return `${winnerName} protected ${formatCurrency(difference)} more grocery value.`
    case 'weight':
      return `${winnerName} kept ${formatKilograms(difference)} more food out of waste.`
    default:
      return `${winnerName} is ahead in this category.`
  }
}
</script>

<template>
  <section class="friend-comparison-view app-page app-mobile-shell">
    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/home" variant="tonal">
      Home
    </app-button>

    <header class="app-page-heading">
      <p>Friend Comparison</p>
      <h1>Comparison breakdown</h1>
      <h2>{{ savedMostHeadline }}</h2>
      <span>{{ savedActionsLeadText }}</span>
    </header>

    <section v-if="appStore.comparisonStopped" class="mock-panel friend-comparison-view__paused">
      <h2>Comparison paused</h2>
      <p>You can resume when you want to compare food-saving progress again.</p>
      <app-button block @click="appStore.setComparisonStopped(false)">Resume comparison</app-button>
    </section>

    <template v-else>
      <section class="mock-panel friend-comparison-view__scoreboard">
        <div class="friend-comparison-view__profile">
          <span
            class="friend-comparison-view__avatar"
            :style="{ background: currentProfile.avatarColor }"
          >
            {{ currentProfile.displayName.charAt(0) }}
          </span>
          <div>
            <strong>{{ currentProfile.displayName }}</strong>
            <small>{{ currentProfile.badgeIcon }} {{ currentProfile.badge }}</small>
          </div>
          <span>{{ savedActions.current }} saved actions</span>
        </div>

        <div class="friend-comparison-view__versus">VS</div>

        <div class="friend-comparison-view__profile">
          <span
            class="friend-comparison-view__avatar"
            :style="{ background: comparedProfile.avatarColor }"
          >
            {{ comparedProfile.displayName.charAt(0) }}
          </span>
          <div>
            <strong>{{ comparedProfile.displayName }}</strong>
            <small>{{ comparedProfile.badgeIcon }} {{ comparedProfile.badge }}</small>
          </div>
          <span>{{ savedActions.compared }} saved actions</span>
        </div>
      </section>

      <section class="friend-comparison-view__metrics" aria-label="Comparison breakdown">
        <article
          v-for="metric in comparisonResults"
          :key="metric.id"
          class="friend-comparison-view__metric"
        >
          <header>
            <v-icon :icon="metric.icon" />
            <div>
              <h2>{{ metric.title }}</h2>
              <p>{{ metric.description }}</p>
            </div>
          </header>

          <div class="friend-comparison-view__values">
            <div :class="{ 'friend-comparison-view__value--winner': metric.winner === 'current' }">
              <strong>{{ currentProfile.displayName }}</strong>
              <span>{{ metric.currentDisplay }}</span>
            </div>
            <div :class="{ 'friend-comparison-view__value--winner': metric.winner === 'compared' }">
              <strong>{{ comparedProfile.displayName }}</strong>
              <span>{{ metric.comparedDisplay }}</span>
            </div>
          </div>

          <p class="friend-comparison-view__result">{{ metric.resultText }}</p>
        </article>
      </section>

      <section class="mock-panel friend-comparison-view__action">
        <h2>Keep food out of the trash</h2>
        <p>
          Compare progress, then use near-expiry items in recipes or share extras early so more food
          becomes meals instead of waste.
        </p>
        <div class="friend-comparison-view__actions">
          <app-button block icon="mdi-chef-hat" to="/app/cook">Find recipes</app-button>
          <app-button block icon="mdi-fridge-outline" to="/app/pantry" variant="tonal">
            Open inventory
          </app-button>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.friend-comparison-view {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-4) var(--space-10);
}

.friend-comparison-view > :deep(.app-button) {
  justify-self: start;
}

.friend-comparison-view .app-page-heading {
  padding: 0 var(--space-1);
}

.friend-comparison-view .app-page-heading span {
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-bold);
}

.friend-comparison-view__scoreboard,
.friend-comparison-view__paused,
.friend-comparison-view__action {
  display: grid;
  gap: var(--space-4);
}

.friend-comparison-view__scoreboard {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
}

.friend-comparison-view__profile {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  color: var(--color-primary);
}

.friend-comparison-view__profile > span:last-child {
  grid-column: 1 / -1;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.friend-comparison-view__avatar {
  display: grid;
  width: 3.8rem;
  height: 3.8rem;
  place-items: center;
  color: var(--color-surface);
  border-radius: var(--radius-pill);
  font-size: 1.45rem;
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-xs);
}

.friend-comparison-view__profile div {
  display: grid;
  min-width: 0;
  gap: 0.1rem;
}

.friend-comparison-view__profile strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-comparison-view__profile small {
  color: var(--color-muted);
  font-size: 0.82rem;
}

.friend-comparison-view__versus {
  width: max-content;
  padding: var(--space-1) var(--space-3);
  margin: 0 auto;
  color: var(--color-surface);
  background: var(--color-accent);
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
}

.friend-comparison-view__metrics {
  display: grid;
  gap: var(--space-4);
}

.friend-comparison-view__metric {
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 46%, transparent);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-soft);
}

.friend-comparison-view__metric header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-3);
  align-items: start;
}

.friend-comparison-view__metric .v-icon {
  color: var(--color-primary);
}

.friend-comparison-view__metric h2,
.friend-comparison-view__action h2,
.friend-comparison-view__paused h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1rem;
  line-height: 1.15;
}

.friend-comparison-view__metric p,
.friend-comparison-view__action p,
.friend-comparison-view__paused p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.35;
}

.friend-comparison-view__values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.friend-comparison-view__values div {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
  padding: var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.friend-comparison-view__values strong {
  overflow: hidden;
  color: var(--color-primary);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.friend-comparison-view__values span {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
}

.friend-comparison-view__values .friend-comparison-view__value--winner {
  background: var(--color-success-soft);
  border-color: color-mix(in srgb, var(--color-success) 36%, transparent);
}

.friend-comparison-view__result {
  padding: var(--space-3);
  color: var(--color-primary-dark) !important;
  background: var(--color-primary-soft);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
}

.friend-comparison-view__actions {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 760px) {
  .friend-comparison-view__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
