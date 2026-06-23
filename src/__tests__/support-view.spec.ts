import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import vuetify from '@/plugins/vuetify'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import SupportView from '@/views/app/support/SupportView.vue'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/app/support', component: SupportView },
      { path: '/app/settings', component: { template: '<div />' } },
    ],
  })
}

async function renderSupportView() {
  const pinia = createPinia()
  const router = makeRouter()

  setActivePinia(pinia)
  useAuthStore().login('diane', 'diane123')
  await router.push('/app/support')
  await router.isReady()

  return {
    ...render(SupportView, {
      global: {
        plugins: [pinia, router, vuetify],
      },
    }),
    appStore: useAppStore(),
  }
}

describe('SupportView', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('prefills contact details and simulates a sent support message', async () => {
    const { appStore } = await renderSupportView()

    expect(screen.getByLabelText('Email')).toHaveValue('diane@inventorie.local')
    expect(screen.getByLabelText('Phone')).toHaveValue('+639171110001')

    await fireEvent.update(
      screen.getByLabelText('Message'),
      'The pantry list should show a clearer low-stock warning.',
    )
    await fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Your message has been sent to the team.')).toBeInTheDocument()
    expect(appStore.supportSubmissions).toHaveLength(1)
  })
})
