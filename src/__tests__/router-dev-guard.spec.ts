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
    ).toBe('/app/home')
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

  it('redirects non-super-admin users away from user management', () => {
    expect(
      resolveInventorieRouteAccess(makeRoute('/app/users'), {
        isProcessing: false,
        isAuthenticated: true,
        canManageUsers: false,
        isSuperAdmin: false,
      }),
    ).toBe('/app/home')
  })

  it('redirects signed-in users away from login to home', () => {
    expect(
      resolveInventorieRouteAccess(makeRoute('/login', 'login'), {
        isProcessing: false,
        isAuthenticated: true,
        canManageUsers: false,
        isSuperAdmin: false,
      }),
    ).toBe('/app/home')
  })
})
