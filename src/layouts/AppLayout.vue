<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BottomNavItem {
  label: string
  icon: string
  to: string
  value: string
  matches: string[]
}

const route = useRoute()

const bottomNavItems: BottomNavItem[] = [
  {
    label: 'Home',
    icon: 'mdi-home-outline',
    to: '/app/home',
    value: 'home',
    matches: ['/app/home', '/app/friends'],
  },
  {
    label: 'Profile',
    icon: 'mdi-account-circle-outline',
    to: '/app/profile',
    value: 'profile',
    matches: ['/app/profile'],
  },
  {
    label: 'Scanner',
    icon: 'mdi-barcode-scan',
    to: '/app/scan',
    value: 'scan',
    matches: ['/app/scan', '/app/review-items', '/app/scans'],
  },
  {
    label: 'Inventory',
    icon: 'mdi-fridge-outline',
    to: '/app/pantry',
    value: 'pantry',
    matches: ['/app/pantry'],
  },
  {
    label: 'Recipes',
    icon: 'mdi-book-open-page-variant-outline',
    to: '/app/cook',
    value: 'recipes',
    matches: ['/app/cook', '/app/recipes', '/app/saved'],
  },
  {
    label: 'Settings',
    icon: 'mdi-cog-outline',
    to: '/app/settings',
    value: 'settings',
    matches: ['/app/settings', '/app/notifications', '/app/plan', '/app/support', '/app/users'],
  },
]

const activeNav = computed(() => {
  const activeItem = bottomNavItems.find((item) =>
    item.matches.some((path) => route.path === path || route.path.startsWith(`${path}/`)),
  )

  return activeItem?.value ?? 'home'
})
</script>

<template>
  <v-app>
    <v-main>
      <v-container class="app-layout__container bottom-nav-spacer" fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation
      :model-value="activeNav"
      class="app-bottom-navigation"
      color="primary"
      grow
      height="76"
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
  padding: 0 0 var(--space-5);
}

.app-bottom-navigation {
  min-height: calc(var(--bottom-navigation-height) + var(--safe-area-bottom));
  padding-bottom: var(--safe-area-bottom);
  background: color-mix(in srgb, var(--color-surface) 92%, white) !important;
  border-top: 1px solid color-mix(in srgb, var(--color-secondary) 42%, transparent);
  box-shadow: 0 -10px 24px rgba(0, 0, 0, 0.14);
}

.app-bottom-navigation__item {
  min-width: 0;
  min-height: 58px;
  margin: var(--space-1) 0 var(--space-2);
  color: var(--color-text);
  border-radius: var(--radius-sm);
}

.app-bottom-navigation__item :deep(.v-btn__content) {
  gap: 0.15rem;
}

.app-bottom-navigation__item span {
  max-width: 100%;
  overflow: hidden;
  font-size: 0.72rem;
  font-weight: var(--font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-bottom-navigation__item--active {
  color: var(--color-primary) !important;
  background: var(--color-secondary-soft);
}

@media (min-width: 760px) {
  .app-layout__container {
    padding-inline: var(--space-5);
  }
}
</style>
