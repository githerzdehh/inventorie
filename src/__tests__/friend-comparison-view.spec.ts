import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import vuetify from '@/plugins/vuetify'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import FriendComparisonView from '@/views/app/home/FriendComparisonView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/app/home', component: { template: '<div />' } },
      { path: '/app/friends/compare', component: FriendComparisonView },
      { path: '/app/cook', component: { template: '<div />' } },
      { path: '/app/pantry', component: { template: '<div />' } },
    ],
  })
}

async function renderFriendComparisonView(options: { paused?: boolean } = {}) {
  const pinia = createPinia()
  const router = makeRouter()

  setActivePinia(pinia)
  useAuthStore().login('diane', 'diane123')

  if (options.paused) {
    useAppStore().setComparisonStopped(true)
  }

  await router.push('/app/friends/compare')
  await router.isReady()

  return render(FriendComparisonView, {
    global: {
      plugins: [pinia, router, vuetify],
    },
  })
}

describe('FriendComparisonView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows the comparison breakdown and food-saving winners', async () => {
    await renderFriendComparisonView()

    expect(screen.getByRole('heading', { name: 'Comparison breakdown' })).toBeInTheDocument()
    expect(screen.getByText('Jasmine saved the most food this week.')).toBeInTheDocument()
    expect(
      screen.getByText('Jasmine is ahead by 7 items saved or shared before expiry.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Who saved the most?')).toBeInTheDocument()
    expect(screen.getByText('Who wasted the least?')).toBeInTheDocument()
    expect(screen.getByText('Jasmine saved 5 items more this week.')).toBeInTheDocument()
    expect(screen.getByText('Jasmine wasted 2 items fewer.')).toBeInTheDocument()
    expect(screen.getByText('Keep food out of the trash')).toBeInTheDocument()
  })

  it('respects the paused comparison preference and can resume', async () => {
    await renderFriendComparisonView({ paused: true })

    expect(screen.getByText('Comparison paused')).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: 'Resume comparison' }))

    expect(screen.getByText('Who saved the most?')).toBeInTheDocument()
  })
})
