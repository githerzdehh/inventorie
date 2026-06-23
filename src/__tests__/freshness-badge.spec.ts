import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import type { FreshnessStatus } from '@/composables/app-types'
import FreshnessBadge from '@/components/common/freshness-badge.vue'
import vuetify from '@/plugins/vuetify'

function renderFreshnessBadge(status: FreshnessStatus | string | null | undefined) {
  return render(FreshnessBadge, {
    props: {
      status,
    },
    global: {
      plugins: [vuetify],
    },
  })
}

describe('freshness-badge', () => {
  it('renders the fresh label', () => {
    renderFreshnessBadge('fresh')

    expect(screen.getByText('Fresh')).toBeInTheDocument()
  })

  it('renders the use soon label', () => {
    renderFreshnessBadge('use-soon')

    expect(screen.getByText('Use Soon')).toBeInTheDocument()
  })

  it('renders the expiring today label', () => {
    renderFreshnessBadge('expiring-today')

    expect(screen.getByText('Expiring Today')).toBeInTheDocument()
  })

  it('renders the past suggested date label', () => {
    renderFreshnessBadge('past-suggested-date')

    expect(screen.getByText('Past Suggested Date')).toBeInTheDocument()
  })

  it('renders the unknown label', () => {
    renderFreshnessBadge('unknown')

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('renders the unknown label for invalid freshness statuses', () => {
    renderFreshnessBadge('not-a-status')

    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
