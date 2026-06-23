import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/app/home/HomeView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/app/home', component: HomeView },
      { path: '/app/friends/compare', component: { template: '<div />' } },
      { path: '/app/profile', component: { template: '<div />' } },
      { path: '/app/pantry/:id', component: { template: '<div />' } },
    ],
  })
}

async function renderHomeView() {
  const pinia = createPinia()
  const router = makeRouter()

  setActivePinia(pinia)
  useAuthStore().login('diane', 'diane123')
  await router.push('/app/home')
  await router.isReady()

  return render(HomeView, {
    global: {
      plugins: [pinia, router, vuetify],
    },
  })
}

describe('HomeView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('links friend comparison to the breakdown and can pause comparison locally', async () => {
    await renderHomeView()

    expect(screen.getByText('Friend Comparison')).toBeInTheDocument()
    expect(screen.getByText('Jasmine')).toBeInTheDocument()
    expect(screen.getByText('Jasmine saved 5 items more this week.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View friend comparison breakdown' })).toHaveAttribute(
      'href',
      '/app/friends/compare',
    )

    await fireEvent.click(screen.getByRole('button', { name: 'Stop comparing' }))

    expect(screen.getByText('Comparison is paused for this browser.')).toBeInTheDocument()
  })
})
