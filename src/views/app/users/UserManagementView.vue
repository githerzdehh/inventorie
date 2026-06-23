<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import SelectMenuField from '@/components/common/select-menu-field.vue'
import { getPhoneValidationMessage } from '@/composables/phone-utils'
import type { StoredAuthUser, ManagedUserInput } from '@/stores/auth'
import { useAuthStore, userRoleLabels } from '@/stores/auth'
import type { UserRole } from '@/composables/app-types'

interface UserDraft {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  role: UserRole
  isSubscribed: boolean
}

const authStore = useAuthStore()
const userDrafts = reactive<Record<string, UserDraft>>({})
const newUser = reactive<ManagedUserInput>({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: 'subscriber',
  isSubscribed: true,
})

const roleOptions = computed(() =>
  authStore.assignableRoles.map((role) => ({
    title: userRoleLabels[role],
    value: role,
  })),
)
const sortedUsers = computed(() =>
  [...authStore.users].sort((first, second) => {
    const roleOrder: Record<UserRole, number> = {
      super_admin: 0,
      admin: 1,
      subscriber: 2,
    }
    const roleComparison = roleOrder[first.role] - roleOrder[second.role]

    return roleComparison || first.displayName.localeCompare(second.displayName)
  }),
)
const userRows = computed(() =>
  sortedUsers.value.flatMap((user) => {
    const draft = userDrafts[user.id]

    return draft ? [{ user, draft }] : []
  }),
)
const newUserPhoneError = computed(() =>
  getPhoneValidationMessage(newUser.phoneNumber, authStore.config.allowedPhoneCountry),
)

function makeDraft(user: StoredAuthUser): UserDraft {
  return {
    username: user.username,
    password: '',
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber ?? '',
    role: user.role,
    isSubscribed: user.isSubscribed,
  }
}

function syncDrafts() {
  for (const user of authStore.users) {
    if (!userDrafts[user.id]) {
      userDrafts[user.id] = makeDraft(user)
    }
  }

  for (const userId of Object.keys(userDrafts)) {
    if (!authStore.users.some((user) => user.id === userId)) {
      delete userDrafts[userId]
    }
  }
}

function resetNewUser() {
  newUser.username = ''
  newUser.password = ''
  newUser.firstName = ''
  newUser.lastName = ''
  newUser.email = ''
  newUser.phoneNumber = ''
  newUser.role = 'subscriber'
  newUser.isSubscribed = true
}

function saveUser(user: StoredAuthUser) {
  const draft = userDrafts[user.id]

  if (!draft) {
    return
  }

  authStore.updateUser(user.id, draft)
}

function deleteUser(user: StoredAuthUser) {
  authStore.deleteUser(user.id)
}

function createUser() {
  if (authStore.createUser(newUser)) {
    resetNewUser()
  }
}

function normalizeRole(value: string): UserRole {
  return authStore.assignableRoles.includes(value as UserRole) ? (value as UserRole) : 'subscriber'
}

function getDraftPhoneError(draft: UserDraft): string | null {
  return getPhoneValidationMessage(draft.phoneNumber, authStore.config.allowedPhoneCountry)
}

function getDraftPhoneErrorMessages(draft: UserDraft): string[] {
  const errorMessage = getDraftPhoneError(draft)

  return errorMessage ? [errorMessage] : []
}

watch(
  () => authStore.users,
  () => syncDrafts(),
  { deep: true, immediate: true },
)
</script>

<template>
  <section class="user-management-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Users</h2>
      <p>Manage account access and registration controls.</p>
    </div>

    <v-alert
      v-if="authStore.errorMessage"
      color="error"
      icon="mdi-alert-circle-outline"
      variant="tonal"
    >
      {{ authStore.errorMessage }}
    </v-alert>

    <v-alert
      v-if="authStore.successMessage"
      class="user-management-view__success-alert"
      icon="mdi-check-circle-outline"
      variant="tonal"
    >
      {{ authStore.successMessage }}
    </v-alert>

    <v-card v-if="authStore.isSuperAdmin" class="user-management-view__panel" border elevation="0">
      <v-card-item>
        <template #prepend>
          <v-avatar class="user-management-view__icon" size="44">
            <v-icon icon="mdi-tune-variant" />
          </v-avatar>
        </template>
        <v-card-title>Super Admin config</v-card-title>
        <v-card-subtitle>Registration is disabled until Super Admin enables it.</v-card-subtitle>
      </v-card-item>
      <v-card-text>
        <v-switch
          :model-value="authStore.canRegister"
          color="primary"
          hide-details
          inset
          label="Allow public registration"
          @update:model-value="authStore.setRegistrationEnabled(Boolean($event))"
        />
        <div class="user-management-view__config-row">
          <span>Allowed phone country</span>
          <v-chip class="user-management-view__role-chip" size="small">
            {{ authStore.allowedPhoneCountryLabel }}
          </v-chip>
        </div>
        <div class="user-management-view__config-actions">
          <app-button
            icon="mdi-database-refresh-outline"
            tone="danger"
            to="/app/dev/reset-data"
            variant="tonal"
          >
            Reset test data
          </app-button>
        </div>
      </v-card-text>
    </v-card>

    <v-card class="user-management-view__panel" border elevation="0">
      <v-card-item>
        <template #prepend>
          <v-avatar class="user-management-view__icon" size="44">
            <v-icon icon="mdi-account-plus-outline" />
          </v-avatar>
        </template>
        <v-card-title>Create user</v-card-title>
        <v-card-subtitle>Admins cannot create or assign Super Admin accounts.</v-card-subtitle>
      </v-card-item>
      <v-card-text class="user-management-view__form">
        <div class="user-management-view__fields">
          <v-text-field v-model="newUser.username" label="Username" variant="outlined" />
          <v-text-field
            v-model="newUser.password"
            label="Password"
            type="password"
            variant="outlined"
          />
          <v-text-field v-model="newUser.firstName" label="First name" variant="outlined" />
          <v-text-field v-model="newUser.lastName" label="Last name" variant="outlined" />
          <v-text-field v-model="newUser.email" label="Email" type="email" variant="outlined" />
          <v-text-field
            v-model="newUser.phoneNumber"
            :error-messages="newUserPhoneError ? [newUserPhoneError] : []"
            :hint="`Optional · ${authStore.allowedPhoneCountryLabel} only`"
            autocomplete="tel"
            inputmode="tel"
            label="Phone number (optional)"
            persistent-hint
            type="tel"
            variant="outlined"
          />
          <select-menu-field
            :model-value="newUser.role"
            :items="roleOptions"
            label="Role"
            @update:model-value="newUser.role = normalizeRole($event)"
          />
          <v-switch
            v-model="newUser.isSubscribed"
            color="primary"
            hide-details
            inset
            label="Subscribed"
          />
        </div>
        <app-button icon="mdi-account-plus-outline" @click="createUser">Create user</app-button>
      </v-card-text>
    </v-card>

    <v-card
      v-for="{ user, draft } in userRows"
      :key="user.id"
      class="user-management-view__panel"
      border
      elevation="0"
    >
      <v-card-item>
        <template #prepend>
          <v-avatar class="user-management-view__icon" size="44">
            <v-icon icon="mdi-account-circle-outline" />
          </v-avatar>
        </template>
        <v-card-title>{{ user.displayName }}</v-card-title>
        <v-card-subtitle>{{ user.username }} · {{ user.email }}</v-card-subtitle>
        <v-card-subtitle class="user-management-view__credential">
          Password: <code>{{ user.password }}</code>
        </v-card-subtitle>
        <template #append>
          <v-chip class="user-management-view__role-chip" size="small">
            {{ userRoleLabels[user.role] }}
          </v-chip>
        </template>
      </v-card-item>

      <v-card-text class="user-management-view__form">
        <v-alert
          v-if="!authStore.canManageUser(user)"
          class="user-management-view__locked-alert"
          icon="mdi-lock-outline"
          variant="tonal"
        >
          This account is controlled by Super Admin.
        </v-alert>

        <div class="user-management-view__fields">
          <v-text-field
            v-model="draft.username"
            :disabled="!authStore.canManageUser(user)"
            label="Username"
            variant="outlined"
          />
          <v-text-field
            v-model="draft.password"
            :disabled="!authStore.canManageUser(user)"
            label="Reset password"
            placeholder="Leave blank to keep current password"
            type="password"
            variant="outlined"
          />
          <v-text-field
            v-model="draft.firstName"
            :disabled="!authStore.canManageUser(user)"
            label="First name"
            variant="outlined"
          />
          <v-text-field
            v-model="draft.lastName"
            :disabled="!authStore.canManageUser(user)"
            label="Last name"
            variant="outlined"
          />
          <v-text-field
            v-model="draft.email"
            :disabled="!authStore.canManageUser(user)"
            label="Email"
            type="email"
            variant="outlined"
          />
          <v-text-field
            v-model="draft.phoneNumber"
            :disabled="!authStore.canManageUser(user)"
            :error-messages="getDraftPhoneErrorMessages(draft)"
            :hint="`Optional · ${authStore.allowedPhoneCountryLabel} only`"
            autocomplete="tel"
            inputmode="tel"
            label="Phone number (optional)"
            persistent-hint
            type="tel"
            variant="outlined"
          />
          <select-menu-field
            :model-value="draft.role"
            :disabled="!authStore.canManageUser(user)"
            :items="roleOptions"
            label="Role"
            @update:model-value="draft.role = normalizeRole($event)"
          />
          <v-switch
            v-model="draft.isSubscribed"
            :disabled="!authStore.canManageUser(user)"
            color="primary"
            hide-details
            inset
            label="Subscribed"
          />
        </div>
      </v-card-text>

      <v-card-actions v-if="authStore.canManageUser(user)" class="user-management-view__actions">
        <app-button icon="mdi-content-save-outline" @click="saveUser(user)">Save user</app-button>
        <app-button
          :disabled="authStore.currentUser?.id === user.id"
          icon="mdi-delete-outline"
          tone="danger"
          variant="tonal"
          @click="deleteUser(user)"
        >
          Delete
        </app-button>
      </v-card-actions>
    </v-card>
  </section>
</template>

<style scoped>
.user-management-view__panel {
  background: var(--color-surface);
  border-color: var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.user-management-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.user-management-view__credential {
  opacity: 1;
}

.user-management-view__credential code {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
}

.user-management-view__form {
  display: grid;
  gap: var(--space-4);
}

.user-management-view__success-alert,
.user-management-view__role-chip {
  color: var(--color-accent-dark);
  background: var(--color-accent-soft);
  border: 1px solid color-mix(in srgb, var(--color-accent) 34%, transparent);
}

.user-management-view__locked-alert {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 36%, transparent);
}

.user-management-view__fields {
  display: grid;
  gap: var(--space-3);
}

.user-management-view__config-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-3);
}

.user-management-view__config-row span {
  color: var(--color-muted);
  font-weight: var(--font-weight-medium);
}

.user-management-view__config-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.user-management-view__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-inline: var(--space-4);
  padding-bottom: var(--space-4);
}

@media (min-width: 760px) {
  .user-management-view__fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
