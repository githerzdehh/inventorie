<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import inventorieLogoUrl from '@/assets/logo/inventorie-logo.png'
import { mockUsers, useAuthStore, userRoleLabels } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const identifier = ref('')
const password = ref('')
const isSubmitting = ref(false)
const showCredentialHints = false

const redirectTo = computed(() => {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/app') ? redirect : '/app/home'
})

async function submitLogin() {
  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  try {
    if (authStore.login(identifier.value, password.value)) {
      await router.push(redirectTo.value)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="login-view app-page">
    <app-card class="login-view__panel" :border="true" tone="surface">
      <div class="login-view__brand">
        <img class="login-view__logo" :src="inventorieLogoUrl" alt="Inventorie" />
        <div>
          <h1>Inventorie</h1>
          <p>Sign in to scan grocery images and manage your pantry.</p>
        </div>
      </div>

      <v-alert
        v-if="authStore.errorMessage"
        color="error"
        icon="mdi-alert-circle-outline"
        variant="tonal"
      >
        {{ authStore.errorMessage }}
      </v-alert>

      <form class="login-view__form" @submit.prevent="submitLogin">
        <v-text-field
          v-model="identifier"
          autocomplete="username"
          label="Username or email"
          type="text"
          variant="outlined"
        />
        <v-text-field
          v-model="password"
          autocomplete="current-password"
          label="Password"
          type="password"
          variant="outlined"
        />
        <app-button :loading="isSubmitting" block icon="mdi-login" size="large" type="submit">
          Sign in
        </app-button>
        <app-button to="/register" tone="secondary" variant="tonal" icon="mdi-account-plus-outline">
          Register
        </app-button>
      </form>

      <div v-if="showCredentialHints" class="login-view__accounts">
        <h2>Available users</h2>
        <div v-for="user in mockUsers" :key="user.id" class="login-view__account">
          <span>{{ user.displayName }} · {{ userRoleLabels[user.role] }}</span>
          <code>{{ user.username }} / {{ user.password }}</code>
        </div>
      </div>
    </app-card>
  </section>
</template>

<style scoped>
.login-view {
  display: grid;
  min-height: calc(100vh - (var(--space-5) * 2));
  place-items: center;
}

.login-view__panel {
  width: min(100%, 30rem);
}

.login-view__brand {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  margin-bottom: var(--space-6);
  text-align: center;
}

.login-view__logo {
  width: 4.75rem;
  height: 4.75rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.login-view__brand h1 {
  margin: 0;
  font-size: clamp(1.7rem, 6vw, 2.4rem);
}

.login-view__brand p {
  margin: var(--space-1) 0 0;
  color: var(--color-muted);
}

.login-view__form,
.login-view__accounts {
  display: grid;
  gap: var(--space-3);
}

.login-view__accounts {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}

.login-view__accounts h2 {
  margin: 0;
  font-size: 0.95rem;
}

.login-view__account {
  display: grid;
  gap: var(--space-1);
  color: var(--color-muted);
  font-size: 0.9rem;
}

.login-view__account span {
  color: var(--color-text);
  font-weight: 700;
}

.login-view__account code {
  overflow-wrap: anywhere;
}
</style>
