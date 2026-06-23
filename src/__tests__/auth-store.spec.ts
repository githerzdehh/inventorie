import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockUsers, useAuthStore } from '@/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defines one user for each supported role', () => {
    expect(mockUsers.map((user) => user.role)).toEqual(['super_admin', 'admin', 'subscriber'])
  })

  it('logs in the super admin user and persists the session', () => {
    const authStore = useAuthStore()

    expect(authStore.login('superadmin', 'super123')).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isAdmin).toBe(true)
    expect(authStore.isSuperAdmin).toBe(true)
    expect(authStore.roleLabel).toBe('Super Admin')
    expect(authStore.currentUser?.email).toBe('superadmin@inventorie.local')

    setActivePinia(createPinia())

    const restoredAuthStore = useAuthStore()

    expect(restoredAuthStore.isAuthenticated).toBe(true)
    expect(restoredAuthStore.isAdmin).toBe(true)
    expect(restoredAuthStore.isSuperAdmin).toBe(true)
  })

  it('logs in the admin user by email without super admin access', () => {
    const authStore = useAuthStore()

    expect(authStore.login('admin@inventorie.local', 'admin123')).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isAdmin).toBe(true)
    expect(authStore.isSuperAdmin).toBe(false)
    expect(authStore.canManageUsers).toBe(true)
    expect(authStore.roleLabel).toBe('Admin')
  })

  it('logs in the subscribed user without admin access', () => {
    const authStore = useAuthStore()

    expect(authStore.login('user', 'user123')).toBe(true)
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isAdmin).toBe(false)
    expect(authStore.isSuperAdmin).toBe(false)
    expect(authStore.canManageUsers).toBe(false)
    expect(authStore.isSubscribed).toBe(true)
  })

  it('keeps public registration disabled by default', () => {
    const authStore = useAuthStore()

    expect(authStore.canRegister).toBe(false)
    expect(authStore.allowedPhoneCountryLabel).toBe('Philippines (+63)')
    expect(
      authStore.registerUser({
        username: 'newuser',
        password: 'new123',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.test',
      }),
    ).toBe(false)
    expect(authStore.errorMessage).toBe('Registration is currently disabled.')
  })

  it('allows only super admin to enable registration', () => {
    const authStore = useAuthStore()

    authStore.login('admin', 'admin123')
    expect(authStore.setRegistrationEnabled(true)).toBe(false)
    expect(authStore.canRegister).toBe(false)

    authStore.login('superadmin', 'super123')
    expect(authStore.setRegistrationEnabled(true)).toBe(true)
    expect(authStore.canRegister).toBe(true)
  })

  it('registers new regular users only when registration is enabled', () => {
    const authStore = useAuthStore()

    authStore.login('superadmin', 'super123')
    authStore.setRegistrationEnabled(true)
    authStore.logout()

    expect(
      authStore.registerUser({
        username: 'newuser',
        password: 'new123',
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.test',
        phoneNumber: '09171234567',
      }),
    ).toBe(true)
    expect(authStore.users.find((user) => user.username === 'newuser')?.role).toBe('subscriber')
    expect(authStore.users.find((user) => user.username === 'newuser')?.phoneNumber).toBe(
      '+639171234567',
    )
    expect(authStore.login('newuser', 'new123')).toBe(true)
  })

  it('rejects non-PH or invalid phone numbers', () => {
    const authStore = useAuthStore()

    authStore.login('superadmin', 'super123')
    authStore.setRegistrationEnabled(true)
    authStore.logout()

    expect(
      authStore.registerUser({
        username: 'badphone',
        password: 'new123',
        firstName: 'Bad',
        lastName: 'Phone',
        email: 'badphone@example.test',
        phoneNumber: '+14155550100',
      }),
    ).toBe(false)
    expect(authStore.errorMessage).toBe('Only Philippines (+63) phone numbers are allowed.')
  })

  it('prevents admins from managing super admin users', () => {
    const authStore = useAuthStore()

    authStore.login('admin', 'admin123')

    expect(authStore.updateUser('super-admin', { firstName: 'Changed' })).toBe(false)
    expect(authStore.errorMessage).toBe('You do not have permission to manage this user.')
    expect(authStore.deleteUser('super-admin')).toBe(false)
    expect(authStore.users.find((user) => user.id === 'super-admin')).toBeTruthy()
  })

  it('allows admins to manage non-super-admin users', () => {
    const authStore = useAuthStore()

    authStore.login('admin', 'admin123')

    expect(authStore.updateUser('subscriber', { firstName: 'Updated' })).toBe(true)
    expect(authStore.users.find((user) => user.id === 'subscriber')?.displayName).toBe(
      'Updated User',
    )
  })

  it('allows super admin to manage all user roles', () => {
    const authStore = useAuthStore()

    authStore.login('superadmin', 'super123')

    expect(authStore.updateUser('admin', { role: 'super_admin' })).toBe(true)
    expect(authStore.users.find((user) => user.id === 'admin')?.role).toBe('super_admin')
  })

  it('requires a signed-in user before requesting account deletion', () => {
    const authStore = useAuthStore()

    expect(authStore.requestAccountDeletion('No longer needed')).toBe(false)
    expect(authStore.errorMessage).toBe('You must be signed in to request account deletion.')

    expect(authStore.login('user', 'user123')).toBe(true)
    expect(authStore.requestAccountDeletion('No longer needed')).toBe(true)
    expect(authStore.successMessage).toBe('Account deletion request submitted.')
  })

  it('rejects invalid credentials and clears the session', () => {
    const authStore = useAuthStore()

    expect(authStore.login('user@inventorie.local', 'wrong')).toBe(false)
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.errorMessage).toBe('Invalid username, email, or password.')
    expect(window.localStorage.getItem('inventorie:auth-session')).toBeNull()
  })

  it('logs out and clears the stored session', () => {
    const authStore = useAuthStore()

    authStore.login('user@inventorie.local', 'user123')
    authStore.logout()

    expect(authStore.isAuthenticated).toBe(false)
    expect(window.localStorage.getItem('inventorie:auth-session')).toBeNull()
  })
})
