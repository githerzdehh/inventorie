import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type RouteRecordRaw,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'

export interface InventorieRouteAccess {
  isProcessing: boolean
  isAuthenticated: boolean
  canManageUsers: boolean
  isSuperAdmin: boolean
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/login',
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/public/LoginView.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/public/RegisterView.vue'),
      },
    ],
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    redirect: '/app/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/app/home/HomeView.vue'),
      },
      {
        path: 'friends/compare',
        name: 'friend-comparison',
        component: () => import('@/views/app/home/FriendComparisonView.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/app/profile/ProfileView.vue'),
      },
      {
        path: 'scan',
        name: 'scan-receipt',
        component: () => import('@/views/app/scanner/ScanReceiptView.vue'),
      },
      {
        path: 'review-items',
        name: 'review-items',
        component: () => import('@/views/app/scanner/ReviewItemsView.vue'),
      },
      {
        path: 'scans',
        name: 'scans',
        component: () => import('@/views/app/scanner/ScansView.vue'),
      },
      {
        path: 'pantry',
        name: 'pantry',
        component: () => import('@/views/app/pantry/PantryView.vue'),
      },
      {
        path: 'pantry/:id',
        name: 'pantry-item',
        component: () => import('@/views/app/pantry/PantryItemView.vue'),
      },
      {
        path: 'cook',
        name: 'recipe-suggestions',
        component: () => import('@/views/app/recipes/RecipeSuggestionsView.vue'),
      },
      {
        path: 'recipes/:id',
        name: 'recipe-details',
        component: () => import('@/views/app/recipes/RecipeDetailsView.vue'),
      },
      {
        path: 'saved',
        name: 'saved-recipes',
        component: () => import('@/views/app/saved/SavedRecipesView.vue'),
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/app/notifications/NotificationsView.vue'),
      },
      {
        path: 'plan',
        name: 'plan',
        component: () => import('@/views/app/plan/PlanView.vue'),
      },
      {
        path: 'support',
        name: 'support',
        component: () => import('@/views/app/support/SupportView.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/app/settings/SettingsView.vue'),
      },
      {
        path: 'settings/terms',
        name: 'settings-terms',
        component: () => import('@/views/app/settings/TermsView.vue'),
      },
      {
        path: 'settings/privacy',
        name: 'settings-privacy',
        component: () => import('@/views/app/settings/PrivacyView.vue'),
      },
      {
        path: 'settings/language',
        name: 'settings-language',
        component: () => import('@/views/app/settings/LanguageSettingsView.vue'),
      },
      {
        path: 'settings/currency',
        name: 'settings-currency',
        component: () => import('@/views/app/settings/CurrencySettingsView.vue'),
      },
      {
        path: 'users',
        name: 'user-management',
        component: () => import('@/views/app/users/UserManagementView.vue'),
      },
      {
        path: 'dev/reset-data',
        name: 'dev-reset-data',
        component: () => import('@/views/app/dev/ResetTestDataView.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export function resolveInventorieRouteAccess(
  to: Pick<RouteLocationNormalized, 'path' | 'name' | 'fullPath'>,
  access: InventorieRouteAccess,
) {
  if (access.isProcessing) {
    return false
  }

  if (to.path.startsWith('/app') && !access.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.path.startsWith('/app/users') && !access.isSuperAdmin) {
    return '/app/home'
  }

  if (to.path.startsWith('/app/dev') && !access.isSuperAdmin) {
    return '/app/home'
  }

  if ((to.name === 'login' || to.name === 'register') && access.isAuthenticated) {
    return '/app/home'
  }

  return true
}

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const scannerStore = useScannerStore()

  authStore.initializeSession()

  return resolveInventorieRouteAccess(to, {
    isProcessing: scannerStore.isProcessing,
    isAuthenticated: authStore.isAuthenticated,
    canManageUsers: authStore.canManageUsers,
    isSuperAdmin: authStore.isSuperAdmin,
  })
})

export default router
