import { defineStore } from 'pinia'
import type {
  AllowedPhoneCountry,
  AuthAppConfig,
  AuthUser,
  UserRole,
} from '@/composables/app-types'
import { getPhoneCountryLabel, validateAndNormalizePhoneNumber } from '@/composables/phone-utils'

export interface StoredAuthUser extends AuthUser {
  password: string
}

export interface UserRegistrationInput {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
}

export interface ManagedUserInput extends UserRegistrationInput {
  role: UserRole
  isSubscribed?: boolean
}

export interface ManagedUserUpdate {
  username?: string
  password?: string
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string | null
  role?: UserRole
  isSubscribed?: boolean
}

interface AuthState {
  currentUser: AuthUser | null
  users: StoredAuthUser[]
  config: AuthAppConfig
  errorMessage: string | null
  successMessage: string | null
}

const sessionStorageKey = 'inventorie:auth-session'
const usersStorageKey = 'inventorie:auth-users'
const configStorageKey = 'inventorie:auth-config'
const seededAt = '2026-06-18T00:00:00.000Z'

const defaultConfig: AuthAppConfig = {
  allowRegistration: false,
  allowedPhoneCountry: 'PH',
}

export const userRoleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  subscriber: 'Subscriber',
}

export const mockUsers: StoredAuthUser[] = [
  {
    id: 'super-admin',
    username: 'superadmin',
    firstName: 'Super',
    lastName: 'Admin',
    displayName: 'Super Admin',
    email: 'superadmin@inventorie.local',
    phoneNumber: null,
    password: 'super123',
    role: 'super_admin',
    isSubscribed: true,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'admin',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    displayName: 'Admin User',
    email: 'admin@inventorie.local',
    phoneNumber: null,
    password: 'admin123',
    role: 'admin',
    isSubscribed: true,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'subscriber-diane',
    username: 'diane',
    firstName: 'Diane',
    lastName: 'Santos',
    displayName: 'Diane Santos',
    email: 'diane@inventorie.local',
    phoneNumber: '+639171110001',
    password: 'diane123',
    role: 'subscriber',
    isSubscribed: true,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'subscriber-jasmine',
    username: 'jasmine',
    firstName: 'Jasmine',
    lastName: 'Reyes',
    displayName: 'Jasmine Reyes',
    email: 'jasmine@inventorie.local',
    phoneNumber: '+639171110002',
    password: 'jasmine123',
    role: 'subscriber',
    isSubscribed: true,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'subscriber-miguel',
    username: 'miguel',
    firstName: 'Miguel',
    lastName: 'Cruz',
    displayName: 'Miguel Cruz',
    email: 'miguel@inventorie.local',
    phoneNumber: '+639171110003',
    password: 'miguel123',
    role: 'subscriber',
    isSubscribed: false,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'subscriber-aria',
    username: 'aria',
    firstName: 'Aria',
    lastName: 'Lim',
    displayName: 'Aria Lim',
    email: 'aria@inventorie.local',
    phoneNumber: '+639171110004',
    password: 'aria123',
    role: 'subscriber',
    isSubscribed: true,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
  {
    id: 'subscriber-noah',
    username: 'noah',
    firstName: 'Noah',
    lastName: 'Garcia',
    displayName: 'Noah Garcia',
    email: 'noah@inventorie.local',
    phoneNumber: '+639171110005',
    password: 'noah123',
    role: 'subscriber',
    isSubscribed: false,
    createdAt: seededAt,
    updatedAt: seededAt,
  },
]

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function makeUserId(username: string): string {
  const normalizedUsername = normalizeCredential(username).replace(/[^a-z0-9]+/g, '-')

  if (globalThis.crypto?.randomUUID) {
    return `user-${normalizedUsername}-${globalThis.crypto.randomUUID()}`
  }

  return `user-${normalizedUsername}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeCredential(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function makeDisplayName(firstName: string, lastName: string): string {
  return `${normalizeName(firstName)} ${normalizeName(lastName)}`.trim()
}

function isUserRole(value: unknown): value is UserRole {
  return value === 'super_admin' || value === 'admin' || value === 'subscriber'
}

function normalizeAllowedPhoneCountry(value: unknown): AllowedPhoneCountry {
  return value === 'PH' ? 'PH' : 'PH'
}

function normalizeAuthConfig(value: unknown): AuthAppConfig {
  if (!value || typeof value !== 'object') {
    return { ...defaultConfig }
  }

  const config = value as Partial<AuthAppConfig>

  return {
    allowRegistration:
      typeof config.allowRegistration === 'boolean'
        ? config.allowRegistration
        : defaultConfig.allowRegistration,
    allowedPhoneCountry: normalizeAllowedPhoneCountry(config.allowedPhoneCountry),
  }
}

function isStoredAuthUser(value: unknown): value is StoredAuthUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Partial<StoredAuthUser>

  return (
    typeof user.id === 'string' &&
    typeof user.username === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.displayName === 'string' &&
    typeof user.email === 'string' &&
    (typeof user.phoneNumber === 'string' || user.phoneNumber === null) &&
    typeof user.password === 'string' &&
    isUserRole(user.role) &&
    typeof user.isSubscribed === 'boolean' &&
    typeof user.createdAt === 'string' &&
    typeof user.updatedAt === 'string'
  )
}

function toAuthUser(user: StoredAuthUser): AuthUser {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isSubscribed: user.isSubscribed,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function readStoredUsers(): StoredAuthUser[] {
  if (!canUseLocalStorage()) {
    return [...mockUsers]
  }

  try {
    const rawUsers = window.localStorage.getItem(usersStorageKey)

    if (!rawUsers) {
      writeStoredUsers(mockUsers)
      return [...mockUsers]
    }

    const parsedUsers = JSON.parse(rawUsers)

    if (!Array.isArray(parsedUsers) || !parsedUsers.every(isStoredAuthUser)) {
      window.localStorage.removeItem(usersStorageKey)
      writeStoredUsers(mockUsers)
      return [...mockUsers]
    }

    const mergedUsers = mergeSeededUsers(parsedUsers)
    writeStoredUsers(mergedUsers)

    return mergedUsers
  } catch {
    window.localStorage.removeItem(usersStorageKey)
    writeStoredUsers(mockUsers)
    return [...mockUsers]
  }
}

function mergeSeededUsers(users: StoredAuthUser[]): StoredAuthUser[] {
  const existingIds = new Set(users.map((user) => user.id))
  const missingSeedUsers = mockUsers.filter((user) => !existingIds.has(user.id))

  return missingSeedUsers.length ? [...users, ...missingSeedUsers] : [...users]
}

function writeStoredUsers(users: StoredAuthUser[]): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(usersStorageKey, JSON.stringify(users))
}

function readStoredConfig(): AuthAppConfig {
  if (!canUseLocalStorage()) {
    return { ...defaultConfig }
  }

  try {
    const rawConfig = window.localStorage.getItem(configStorageKey)

    if (!rawConfig) {
      writeStoredConfig(defaultConfig)
      return { ...defaultConfig }
    }

    const parsedConfig = JSON.parse(rawConfig)

    const normalizedConfig = normalizeAuthConfig(parsedConfig)
    writeStoredConfig(normalizedConfig)

    return normalizedConfig
  } catch {
    window.localStorage.removeItem(configStorageKey)
    writeStoredConfig(defaultConfig)
    return { ...defaultConfig }
  }
}

function writeStoredConfig(config: AuthAppConfig): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(configStorageKey, JSON.stringify(config))
}

function readStoredSession(users = readStoredUsers()): AuthUser | null {
  if (!canUseLocalStorage()) {
    return null
  }

  try {
    const rawSession = window.localStorage.getItem(sessionStorageKey)

    if (!rawSession) {
      return null
    }

    const parsedSession = JSON.parse(rawSession) as Partial<AuthUser>
    const storedUser = users.find((user) => user.id === parsedSession.id)

    if (!storedUser) {
      window.localStorage.removeItem(sessionStorageKey)
      return null
    }

    return toAuthUser(storedUser)
  } catch {
    window.localStorage.removeItem(sessionStorageKey)
    return null
  }
}

function writeStoredSession(user: AuthUser | null): void {
  if (!canUseLocalStorage()) {
    return
  }

  if (!user) {
    window.localStorage.removeItem(sessionStorageKey)
    return
  }

  window.localStorage.setItem(sessionStorageKey, JSON.stringify(user))
}

function validateAccountInput(input: UserRegistrationInput, config: AuthAppConfig): string | null {
  if (!input.username.trim()) {
    return 'Username is required.'
  }

  if (!input.password.trim()) {
    return 'Password is required.'
  }

  if (!input.firstName.trim()) {
    return 'First name is required.'
  }

  if (!input.lastName.trim()) {
    return 'Last name is required.'
  }

  if (!input.email.trim()) {
    return 'Email is required.'
  }

  const phoneResult = validateAndNormalizePhoneNumber(input.phoneNumber, config.allowedPhoneCountry)

  if (phoneResult.errorMessage) {
    return phoneResult.errorMessage
  }

  return null
}

function isDuplicateCredential(
  users: StoredAuthUser[],
  input: Pick<UserRegistrationInput, 'username' | 'email'>,
  ignoredUserId?: string,
): boolean {
  const normalizedUsername = normalizeCredential(input.username)
  const normalizedEmail = normalizeCredential(input.email)

  return users.some(
    (user) =>
      user.id !== ignoredUserId &&
      (normalizeCredential(user.username) === normalizedUsername ||
        normalizeCredential(user.email) === normalizedEmail),
  )
}

function makeStoredUser(input: ManagedUserInput, config: AuthAppConfig): StoredAuthUser {
  const now = new Date().toISOString()
  const firstName = normalizeName(input.firstName)
  const lastName = normalizeName(input.lastName)
  const phoneResult = validateAndNormalizePhoneNumber(input.phoneNumber, config.allowedPhoneCountry)

  return {
    id: makeUserId(input.username),
    username: normalizeCredential(input.username),
    firstName,
    lastName,
    displayName: makeDisplayName(firstName, lastName),
    email: normalizeCredential(input.email),
    phoneNumber: phoneResult.phoneNumber,
    password: input.password,
    role: input.role,
    isSubscribed: input.isSubscribed ?? true,
    createdAt: now,
    updatedAt: now,
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const users = readStoredUsers()

    return {
      currentUser: readStoredSession(users),
      users,
      config: readStoredConfig(),
      errorMessage: null,
      successMessage: null,
    }
  },
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    isSuperAdmin: (state) => state.currentUser?.role === 'super_admin',
    isAdmin: (state) =>
      state.currentUser?.role === 'admin' || state.currentUser?.role === 'super_admin',
    canManageUsers: (state) => state.currentUser?.role === 'super_admin',
    canRegister: (state) => state.config.allowRegistration,
    allowedPhoneCountryLabel: (state) => getPhoneCountryLabel(state.config.allowedPhoneCountry),
    isSubscribed: (state) => Boolean(state.currentUser?.isSubscribed),
    roleLabel: (state) => (state.currentUser ? userRoleLabels[state.currentUser.role] : ''),
    assignableRoles: (state): UserRole[] => {
      if (state.currentUser?.role === 'super_admin') {
        return ['super_admin', 'admin', 'subscriber']
      }

      return []
    },
  },
  actions: {
    initializeSession() {
      this.users = readStoredUsers()
      this.config = readStoredConfig()
      this.currentUser = readStoredSession(this.users)
    },
    persistUsers() {
      writeStoredUsers(this.users)

      if (this.currentUser) {
        const storedCurrentUser = this.users.find((user) => user.id === this.currentUser?.id)
        this.currentUser = storedCurrentUser ? toAuthUser(storedCurrentUser) : null
        writeStoredSession(this.currentUser)
      }
    },
    login(identifier: string, password: string): boolean {
      const normalizedIdentifier = normalizeCredential(identifier)
      const user = this.users.find(
        (storedUser) =>
          (normalizeCredential(storedUser.email) === normalizedIdentifier ||
            normalizeCredential(storedUser.username) === normalizedIdentifier) &&
          storedUser.password === password,
      )

      if (!user) {
        this.currentUser = null
        this.errorMessage = 'Invalid username, email, or password.'
        this.successMessage = null
        writeStoredSession(null)
        return false
      }

      this.currentUser = toAuthUser(user)
      this.errorMessage = null
      this.successMessage = null
      writeStoredSession(this.currentUser)

      return true
    },
    logout() {
      this.currentUser = null
      this.errorMessage = null
      this.successMessage = null
      writeStoredSession(null)
    },
    canManageUser(targetUser: AuthUser | StoredAuthUser): boolean {
      if (this.currentUser?.role === 'super_admin') {
        return true
      }

      return false
    },
    setRegistrationEnabled(enabled: boolean): boolean {
      if (!this.isSuperAdmin) {
        this.errorMessage = 'Only Super Admin can change registration settings.'
        this.successMessage = null
        return false
      }

      this.config = {
        ...this.config,
        allowRegistration: enabled,
      }
      this.errorMessage = null
      this.successMessage = `Registration ${enabled ? 'enabled' : 'disabled'}.`
      writeStoredConfig(this.config)

      return true
    },
    setAllowedPhoneCountry(country: AllowedPhoneCountry): boolean {
      if (!this.isSuperAdmin) {
        this.errorMessage = 'Only Super Admin can change phone settings.'
        this.successMessage = null
        return false
      }

      this.config = {
        ...this.config,
        allowedPhoneCountry: normalizeAllowedPhoneCountry(country),
      }
      this.errorMessage = null
      this.successMessage = `Phone country set to ${getPhoneCountryLabel(this.config.allowedPhoneCountry)}.`
      writeStoredConfig(this.config)

      return true
    },
    registerUser(input: UserRegistrationInput): boolean {
      if (!this.config.allowRegistration) {
        this.errorMessage = 'Registration is currently disabled.'
        this.successMessage = null
        return false
      }

      return this.createUser(
        {
          ...input,
          role: 'subscriber',
          isSubscribed: true,
        },
        { publicRegistration: true },
      )
    },
    createUser(input: ManagedUserInput, options: { publicRegistration?: boolean } = {}): boolean {
      const validationError = validateAccountInput(input, this.config)

      if (validationError) {
        this.errorMessage = validationError
        this.successMessage = null
        return false
      }

      if (isDuplicateCredential(this.users, input)) {
        this.errorMessage = 'Username or email is already in use.'
        this.successMessage = null
        return false
      }

      if (!options.publicRegistration) {
        if (!this.canManageUsers) {
          this.errorMessage = 'You do not have permission to create users.'
          this.successMessage = null
          return false
        }

        if (!this.assignableRoles.includes(input.role)) {
          this.errorMessage = 'You do not have permission to assign that role.'
          this.successMessage = null
          return false
        }
      }

      const user = makeStoredUser(input, this.config)
      this.users = [...this.users, user]
      this.persistUsers()
      this.errorMessage = null
      this.successMessage = options.publicRegistration
        ? 'Account registered. You can now sign in.'
        : 'User account created.'

      return true
    },
    updateUser(userId: string, updates: ManagedUserUpdate): boolean {
      const user = this.users.find((storedUser) => storedUser.id === userId)

      if (!user) {
        this.errorMessage = 'User account was not found.'
        this.successMessage = null
        return false
      }

      if (!this.canManageUser(user)) {
        this.errorMessage = 'You do not have permission to manage this user.'
        this.successMessage = null
        return false
      }

      const nextRole = updates.role ?? user.role

      if (!this.assignableRoles.includes(nextRole)) {
        this.errorMessage = 'You do not have permission to assign that role.'
        this.successMessage = null
        return false
      }

      const nextUsername = updates.username ?? user.username
      const nextEmail = updates.email ?? user.email
      const nextPhoneResult =
        typeof updates.phoneNumber === 'undefined'
          ? { phoneNumber: user.phoneNumber, errorMessage: null }
          : validateAndNormalizePhoneNumber(updates.phoneNumber, this.config.allowedPhoneCountry)

      if (nextPhoneResult.errorMessage) {
        this.errorMessage = nextPhoneResult.errorMessage
        this.successMessage = null
        return false
      }

      if (isDuplicateCredential(this.users, { username: nextUsername, email: nextEmail }, userId)) {
        this.errorMessage = 'Username or email is already in use.'
        this.successMessage = null
        return false
      }

      const firstName = normalizeName(updates.firstName ?? user.firstName)
      const lastName = normalizeName(updates.lastName ?? user.lastName)

      this.users = this.users.map((storedUser) =>
        storedUser.id === userId
          ? {
              ...storedUser,
              username: normalizeCredential(nextUsername),
              firstName,
              lastName,
              displayName: makeDisplayName(firstName, lastName),
              email: normalizeCredential(nextEmail),
              phoneNumber: nextPhoneResult.phoneNumber,
              password: updates.password?.trim() || storedUser.password,
              role: nextRole,
              isSubscribed: updates.isSubscribed ?? storedUser.isSubscribed,
              updatedAt: new Date().toISOString(),
            }
          : storedUser,
      )
      this.persistUsers()
      this.errorMessage = null
      this.successMessage = 'User account updated.'

      return true
    },
    requestAccountDeletion(feedback: string): boolean {
      if (!this.currentUser) {
        this.errorMessage = 'You must be signed in to request account deletion.'
        this.successMessage = null
        return false
      }

      if (feedback.trim().length > 2000) {
        this.errorMessage = 'Account deletion feedback must be 2,000 characters or fewer.'
        this.successMessage = null
        return false
      }

      this.errorMessage = null
      this.successMessage = 'Account deletion request submitted.'

      return true
    },
    deleteCurrentAccount(feedback = ''): boolean {
      if (!this.currentUser) {
        this.errorMessage = 'You must be signed in to delete your account.'
        this.successMessage = null
        return false
      }

      if (this.currentUser.role === 'super_admin') {
        this.errorMessage = 'Super Admin account deletion is blocked.'
        this.successMessage = null
        return false
      }

      if (feedback.trim().length > 2000) {
        this.errorMessage = 'Account deletion feedback must be 2,000 characters or fewer.'
        this.successMessage = null
        return false
      }

      const deletedUserId = this.currentUser.id
      this.users = this.users.filter((storedUser) => storedUser.id !== deletedUserId)
      this.currentUser = null
      writeStoredUsers(this.users)
      writeStoredSession(null)
      this.errorMessage = null
      this.successMessage = 'Account deleted.'

      return true
    },
    deleteUser(userId: string): boolean {
      const user = this.users.find((storedUser) => storedUser.id === userId)

      if (!user) {
        this.errorMessage = 'User account was not found.'
        this.successMessage = null
        return false
      }

      if (this.currentUser?.id === user.id) {
        this.errorMessage = 'You cannot delete your active account.'
        this.successMessage = null
        return false
      }

      if (!this.canManageUser(user)) {
        this.errorMessage = 'You do not have permission to manage this user.'
        this.successMessage = null
        return false
      }

      this.users = this.users.filter((storedUser) => storedUser.id !== userId)
      this.persistUsers()
      this.errorMessage = null
      this.successMessage = 'User account deleted.'

      return true
    },
  },
})
