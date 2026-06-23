import { render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import UserManagementView from '@/views/app/users/UserManagementView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/app/users',
        component: UserManagementView,
      },
      {
        path: '/app/dev/reset-data',
        component: { template: '<div />' },
      },
    ],
  })
}

async function renderUserManagementView(identifier: string, password: string) {
  const pinia = createPinia()
  const router = makeRouter()

  setActivePinia(pinia)
  useAuthStore().login(identifier, password)
  await router.push('/app/users')
  await router.isReady()

  return render(UserManagementView, {
    global: {
      plugins: [pinia, router, vuetify],
    },
  })
}

describe('UserManagementView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the reset test data link for super admin users', async () => {
    await renderUserManagementView('superadmin', 'super123')

    const resetLink = screen.getByRole('link', { name: 'Reset test data' })

    expect(resetLink).toHaveAttribute('href', '/app/dev/reset-data')
  })

  it('hides the reset test data link for non-super-admin managers', async () => {
    await renderUserManagementView('admin', 'admin123')

    expect(screen.queryByRole('link', { name: 'Reset test data' })).not.toBeInTheDocument()
  })
})
