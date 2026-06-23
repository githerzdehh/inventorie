<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import {
  mockComparisonProfiles,
  mockDashboardStats,
  mockFoodItems,
  type MockComparisonProfile,
} from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const appStore = useAppStore()
appStore.initializePreferences()

const currentUserFirstName = computed(() => authStore.currentUser?.firstName || 'friend')
const nearExpiryFoods = computed(() =>
  [...mockFoodItems]
    .sort((first, second) => first.expiryDate.localeCompare(second.expiryDate))
    .slice(0, 4),
)
const currentProfile = computed(
  () =>
    mockComparisonProfiles.find((profile) => profile.id === authStore.currentUser?.id) ??
    getFallbackComparisonProfile(),
)
const comparedProfile = computed(
  () =>
    mockComparisonProfiles.find((profile) => profile.id !== currentProfile.value.id) ??
    currentProfile.value,
)
const comparisonSummary = computed(() => {
  const savedDifference = comparedProfile.value.savedCount - currentProfile.value.savedCount

  if (savedDifference > 0) {
    return `${comparedProfile.value.displayName} saved ${formatItemCount(savedDifference)} more this week.`
  }

  if (savedDifference < 0) {
    return `${currentProfile.value.displayName} saved ${formatItemCount(Math.abs(savedDifference))} more this week.`
  }

  return `${currentProfile.value.displayName} and ${comparedProfile.value.displayName} saved the same number of items this week.`
})

function getFallbackComparisonProfile(): MockComparisonProfile {
  const profile = mockComparisonProfiles[0]

  if (!profile) {
    throw new Error('Friend comparison needs at least one profile.')
  }

  return profile
}

function formatItemCount(value: number): string {
  return `${value} ${value === 1 ? 'item' : 'items'}`
}

function formatDaysLeft(expiryDate: string): string {
  const today = new Date('2026-06-23T00:00:00.000Z')
  const expiry = new Date(`${expiryDate}T00:00:00.000Z`)
  const days = Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000))

  return days === 1 ? '1 day left' : `${days} days left`
}
</script>

<template>
  <section class="home-view app-page app-mobile-shell">
    <header class="home-view__topbar">
      <img class="home-view__logo" src="@/assets/logo/inventorie-logo.png" alt="Inventorie" />
      <h1>Good Day, {{ currentUserFirstName }}!</h1>
      <router-link class="home-view__avatar" to="/app/profile" aria-label="Open profile">
        {{ currentUserFirstName.charAt(0).toUpperCase() }}
      </router-link>
    </header>

    <div class="home-view__grid">
      <section class="mock-panel home-view__expiry">
        <h2>Near Expiry Foods</h2>
        <router-link
          v-for="food in nearExpiryFoods"
          :key="food.id"
          class="home-view__food-row"
          :to="`/app/pantry/${food.id}`"
        >
          <span class="home-view__food-icon">{{ food.icon }}</span>
          <span>
            <strong>{{ food.displayName }}</strong>
            <small>{{ formatDaysLeft(food.expiryDate) }}</small>
          </span>
        </router-link>
      </section>

      <section class="mock-panel home-view__tracker">
        <h2>Food Tracker</h2>
        <div class="home-view__bars" aria-label="Food tracker breakdown">
          <span class="home-view__bar home-view__bar--used" />
          <span class="home-view__bar home-view__bar--donated" />
          <span class="home-view__bar home-view__bar--wasted" />
          <div>
            <p>
              <strong>{{ mockDashboardStats.tracker.used }}% Used:</strong> Used 15 foods in
              cooking.
            </p>
            <p>
              <strong>{{ mockDashboardStats.tracker.donated }}% Donated:</strong> Shared 2 foods
              with friends.
            </p>
            <p>
              <strong>{{ mockDashboardStats.tracker.wasted }}% Wasted:</strong> 3 foods got expired.
            </p>
          </div>
        </div>
      </section>

      <section class="mock-panel home-view__actions">
        <h2>Food Actions</h2>
        <div class="home-view__bars home-view__bars--compact">
          <span class="home-view__bar home-view__bar--used" />
          <span class="home-view__bar home-view__bar--donated" />
          <span class="home-view__bar home-view__bar--wasted" />
          <div>
            <p>
              <strong>{{ mockDashboardStats.actions.used }}% Used</strong>
            </p>
            <p>
              <strong>{{ mockDashboardStats.actions.donated }}% Donated</strong>
            </p>
            <p>
              <strong>{{ mockDashboardStats.actions.wasted }}% Wasted</strong>
            </p>
          </div>
        </div>
      </section>

      <section v-if="!appStore.comparisonStopped" class="mock-panel home-view__comparison">
        <router-link
          class="home-view__comparison-link"
          to="/app/friends/compare"
          aria-label="View friend comparison breakdown"
        >
          <h2>Friend Comparison</h2>
          <div class="home-view__versus">
            <span
              class="home-view__avatar home-view__avatar--large"
              :style="{ background: currentProfile.avatarColor }"
            >
              {{ currentProfile.displayName.charAt(0) }}
            </span>
            <strong>VS</strong>
            <span
              class="home-view__avatar home-view__avatar--large"
              :style="{ background: comparedProfile.avatarColor }"
            >
              {{ comparedProfile.displayName.charAt(0) }}
            </span>
          </div>
          <div class="home-view__comparison-names">
            <strong>{{ currentProfile.displayName }}</strong>
            <strong>{{ comparedProfile.displayName }}</strong>
          </div>
          <p class="home-view__badge">{{ currentProfile.badgeIcon }} {{ currentProfile.badge }}</p>
          <p class="home-view__badge">
            {{ comparedProfile.badgeIcon }} {{ comparedProfile.badge }}
          </p>
          <p class="home-view__note">{{ comparisonSummary }}</p>
          <span class="home-view__comparison-cta">
            <v-icon icon="mdi-chart-box-outline" size="small" />
            View breakdown
          </span>
        </router-link>
        <app-button
          block
          size="small"
          variant="tonal"
          @click.stop="appStore.setComparisonStopped(true)"
        >
          Stop comparing
        </app-button>
      </section>

      <section v-else class="mock-panel home-view__comparison">
        <h2>Friend Comparison</h2>
        <p class="home-view__note">Comparison is paused for this browser.</p>
        <app-button block size="small" @click="appStore.setComparisonStopped(false)">
          Resume comparison
        </app-button>
      </section>
    </div>
  </section>
</template>

<style scoped>
.home-view {
  padding-bottom: var(--space-8);
}

.home-view__topbar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: center;
  padding: calc(var(--space-4) + var(--safe-area-top)) var(--space-4) var(--space-3);
  margin-bottom: var(--space-8);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.home-view__logo {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-xs);
}

.home-view__topbar h1 {
  margin: 0;
  color: var(--color-primary);
  font-size: clamp(1.45rem, 6vw, 2rem);
  line-height: 1;
}

.home-view__avatar {
  display: inline-grid;
  width: 2.9rem;
  height: 2.9rem;
  place-items: center;
  color: var(--color-secondary);
  background: var(--color-primary);
  border: 3px solid var(--color-primary);
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-bold);
}

.home-view__avatar--large {
  width: 3.5rem;
  height: 3.5rem;
}

.home-view__avatar--muted {
  background: #9bb8e8;
}

.home-view__grid {
  display: grid;
  gap: var(--space-5);
  padding-inline: var(--space-4);
}

.home-view__food-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-2);
  color: var(--color-primary);
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-text) 18%, transparent);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-xs);
}

.home-view__food-icon {
  font-size: 2rem;
}

.home-view__food-row span:last-child {
  display: grid;
}

.home-view__food-row small {
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
}

.home-view__bars {
  display: grid;
  grid-template-columns: 1rem 1rem 1rem minmax(0, 1fr);
  gap: var(--space-1);
  min-height: 10rem;
}

.home-view__bars--compact {
  min-height: 8rem;
}

.home-view__bar {
  align-self: end;
  min-height: 35%;
}

.home-view__bar--used {
  height: 100%;
  background: #2e9230;
}

.home-view__bar--donated {
  height: 60%;
  background: #005bd7;
}

.home-view__bar--wasted {
  height: 70%;
  background: #ff2a34;
}

.home-view__bars p,
.home-view__note {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.2;
}

.home-view__bars strong {
  color: var(--color-primary);
}

.home-view__comparison-link {
  display: grid;
  gap: var(--space-3);
  color: inherit;
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.home-view__comparison-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.home-view__versus,
.home-view__comparison-names {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-3);
  align-items: center;
  justify-items: center;
}

.home-view__comparison-names {
  grid-template-columns: 1fr 1fr;
  color: var(--color-primary);
  font-size: 0.85rem;
}

.home-view__badge {
  margin: 0;
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.home-view__comparison-cta {
  display: inline-flex;
  gap: var(--space-1);
  align-items: center;
  justify-self: start;
  color: var(--color-primary-dark);
  font-size: 0.86rem;
  font-weight: var(--font-weight-bold);
}

@media (hover: hover) and (pointer: fine) {
  .home-view__comparison-link:hover {
    transform: translateY(-1px);
  }
}

@media (min-width: 760px) {
  .home-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
