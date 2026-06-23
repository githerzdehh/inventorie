import type { RouteLocationNormalized } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { resolveInventorieRouteAccess } from '@/router'

function makeRoute(path: string, name: string | null = null): RouteLocationNormalized {
  return {
    path,
    name,
    fullPath: path,
  } as RouteLocationNormalized
}

describe('router dev guard', () => {
  it('redirects non-super-admin users away from the hidden reset page', () => {
    expect(
      resolveInventorieRouteAccess(makeRoute('/app/dev/reset-data'), {
        isProcessing: false,
        isAuthenticated: true,
        canManageUsers: true,
        isSuperAdmin: false,
      }),
    ).toBe('/app/scan')
  })

  it('allows super admin users to access the hidden reset page', () => {
    expect(
      resolveInventorieRouteAccess(makeRoute('/app/dev/reset-data'), {
        isProcessing: false,
        isAuthenticated: true,
        canManageUsers: true,
        isSuperAdmin: true,
      }),
    ).toBe(true)
  })
})
