<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'

interface BottomNavItem {
  label: string
  icon: string
  to: string
  value: string
  matches: string[]
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const scannerStore = useScannerStore()

const baseBottomNavItems: BottomNavItem[] = [
  {
    label: 'Scan',
    icon: 'mdi-image-search-outline',
    to: '/app/scan',
    value: 'scan',
    matches: ['/app/scan', '/app/review-items', '/app/scans'],
  },
  {
    label: 'Pantry',
    icon: 'mdi-safe-square-outline',
    to: '/app/pantry',
    value: 'pantry',
    matches: ['/app/pantry'],
  },
  {
    label: 'Cook',
    icon: 'mdi-silverware-fork-knife',
    to: '/app/cook',
    value: 'cook',
    matches: ['/app/cook', '/app/recipes'],
  },
  {
    label: 'Saved',
    icon: 'mdi-bookmark-outline',
    to: '/app/saved',
    value: 'saved',
    matches: ['/app/saved'],
  },
]

const bottomNavItems = computed<BottomNavItem[]>(() => [
  ...baseBottomNavItems,
  ...(authStore.canManageUsers
    ? [
        {
          label: 'Users',
          icon: 'mdi-account-group-outline',
          to: '/app/users',
          value: 'users',
          matches: ['/app/users', '/app/dev'],
        },
      ]
    : []),
])

const activeNav = computed(() => {
  const activeItem = bottomNavItems.value.find((item) =>
    item.matches.some((path) => route.path === path || route.path.startsWith(`${path}/`)),
  )

  return activeItem?.value ?? 'scan'
})

async function signOut() {
  scannerStore.setDiagnosticsEnabled(false)
  scannerStore.clearDebugEvents()
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="app-layout__container bottom-nav-spacer" fluid>
        <div class="app-layout__session">
          <div class="app-layout__identity">
            <span>{{ authStore.currentUser?.displayName }}</span>
            <v-chip v-if="authStore.roleLabel" class="app-layout__role" size="small">
              {{ authStore.roleLabel }}
            </v-chip>
          </div>
          <app-button icon="mdi-logout" size="small" tone="ghost" variant="tonal" @click="signOut">
            Sign out
          </app-button>
        </div>
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation
      :model-value="activeNav"
      class="app-bottom-navigation"
      color="primary"
      grow
      height="72"
      mandatory
      selected-class="app-bottom-navigation__item--active"
    >
      <v-btn
        v-for="item in bottomNavItems"
        :key="item.value"
        :active="activeNav === item.value"
        :to="item.to"
        :value="item.value"
        class="app-bottom-navigation__item"
      >
        <v-icon :icon="item.icon" />
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.app-layout__container {
  min-height: 100vh;
  padding: calc(var(--space-4) + var(--safe-area-top)) var(--space-4) var(--space-5);
}

.app-layout__session {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-5);
  color: var(--color-muted);
  font-size: 0.9rem;
}

.app-layout__identity {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  justify-self: start;
}

.app-layout__identity span {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-layout__role {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.app-bottom-navigation {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface) !important;
  box-shadow: 0 -10px 26px color-mix(in srgb, var(--color-primary) 8%, transparent);
  min-height: calc(var(--bottom-navigation-height) + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);
}

.app-bottom-navigation__item {
  color: var(--color-muted);
  min-height: 56px;
  border-radius: var(--radius-lg);
  margin: var(--space-1) var(--space-1) var(--space-2);
}

.app-bottom-navigation__item--active {
  color: var(--color-primary-dark) !important;
  background: var(--color-primary-soft);
}

@media (min-width: 760px) {
  .app-layout__container {
    padding-block: calc(var(--space-8) + var(--safe-area-top)) var(--space-8);
    padding-inline: var(--space-5);
  }
}
</style>
