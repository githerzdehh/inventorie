<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import { mockComparisonProfiles } from '@/mocks/data/mock-app'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'

const router = useRouter()
const authStore = useAuthStore()
const scannerStore = useScannerStore()

const displayName = computed(() => authStore.currentUser?.firstName || 'friend')
const comparisonProfile = computed(() =>
  mockComparisonProfiles.find((profile) => profile.id === authStore.currentUser?.id) ??
  mockComparisonProfiles[0],
)

async function signOut() {
  scannerStore.setDiagnosticsEnabled(false)
  scannerStore.clearDebugEvents()
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <section class="profile-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>YOUR PROFILE</h1>
    </header>

    <div class="profile-view__card">
      <div class="profile-view__avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
      <h2>hi {{ displayName.toLowerCase() }}!</h2>

      <div class="profile-view__stats">
        <div>
          <strong>{{ comparisonProfile?.friends }}</strong>
          <span>friends</span>
        </div>
        <div>
          <strong>{{ comparisonProfile?.inventoryCount }}</strong>
          <span>inventory</span>
        </div>
        <div>
          <strong>{{ comparisonProfile?.badgeIcon }}</strong>
          <span>{{ comparisonProfile?.badge }}</span>
        </div>
      </div>

      <div class="profile-view__actions">
        <app-button block icon="mdi-account-outline" size="large" to="/app/settings" variant="tonal">
          personal settings
        </app-button>
        <app-button block icon="mdi-cog-outline" size="large" to="/app/settings">
          general app settings
        </app-button>
        <app-button block icon="mdi-clipboard-list-outline" size="large" to="/app/plan">
          your subscription
        </app-button>
        <app-button block icon="mdi-logout" size="large" @click="signOut">log out</app-button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-view {
  min-height: 100vh;
  padding-bottom: var(--space-10);
}

.profile-view__card {
  display: grid;
  gap: var(--space-5);
  justify-items: center;
  margin: var(--space-10) auto 0;
  padding: var(--space-8) var(--space-5);
  background: color-mix(in srgb, var(--color-secondary) 68%, var(--color-bg));
  border: 2px solid var(--color-primary);
  border-radius: 42px;
}

.profile-view__avatar {
  display: grid;
  width: 10rem;
  height: 10rem;
  place-items: center;
  color: var(--color-secondary);
  background: var(--color-primary);
  border: 8px solid var(--color-primary);
  border-radius: var(--radius-xl);
  box-shadow: -18px 14px 0 rgba(248, 166, 13, 0.35);
  font-size: 5rem;
  font-weight: var(--font-weight-bold);
}

.profile-view h2 {
  margin: -0.75rem 0 0;
  color: var(--color-primary);
  font-size: 2.1rem;
  line-height: 1;
  text-shadow: 0.12em 0.12em 0 rgba(248, 166, 13, 0.55);
}

.profile-view__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  width: 100%;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-bg) 70%, white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.profile-view__stats div {
  display: grid;
  gap: var(--space-1);
  justify-items: center;
  padding: var(--space-4) var(--space-2);
  color: var(--color-secondary);
  border-right: 1px solid color-mix(in srgb, var(--color-secondary) 42%, transparent);
}

.profile-view__stats div:last-child {
  border-right: 0;
}

.profile-view__stats strong {
  color: var(--color-accent);
  font-size: 1.6rem;
}

.profile-view__stats span {
  color: var(--color-muted);
  font-size: 0.72rem;
  text-align: center;
}

.profile-view__actions {
  display: grid;
  width: 100%;
  gap: var(--space-5);
}

.profile-view__actions :deep(.v-btn) {
  min-height: 5rem;
  justify-content: start;
  padding-inline: var(--space-6);
  color: var(--color-secondary) !important;
  background: var(--color-primary) !important;
  border-radius: var(--radius-xl);
  box-shadow: -10px -10px 0 rgba(248, 166, 13, 0.3);
  font-size: 1.25rem;
}
</style>
