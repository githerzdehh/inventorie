<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import inventorieLogoUrl from '@/assets/logo/inventorie-logo.png'
import { getPhoneValidationMessage } from '@/composables/phone-utils'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isSubmitting = ref(false)
const form = reactive({
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
})
const phoneError = computed(() =>
  getPhoneValidationMessage(form.phoneNumber, authStore.config.allowedPhoneCountry),
)

async function submitRegistration() {
  if (isSubmitting.value || !authStore.canRegister) {
    return
  }

  isSubmitting.value = true

  try {
    if (authStore.registerUser(form)) {
      await router.push('/login')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="register-view app-page">
    <app-card class="register-view__panel" :border="true" tone="surface">
      <div class="register-view__brand">
        <img class="register-view__logo" :src="inventorieLogoUrl" alt="Inventorie" />
        <div>
          <h1>Create account</h1>
          <p>Register a Inventorie account when registration is open.</p>
        </div>
      </div>

      <v-alert
        v-if="!authStore.canRegister"
        class="register-view__disabled-alert"
        icon="mdi-lock-outline"
        variant="tonal"
      >
        Registration is currently disabled.
      </v-alert>

      <v-alert
        v-if="authStore.errorMessage"
        color="error"
        icon="mdi-alert-circle-outline"
        variant="tonal"
      >
        {{ authStore.errorMessage }}
      </v-alert>

      <form class="register-view__form" @submit.prevent="submitRegistration">
        <v-text-field
          v-model="form.username"
          :disabled="!authStore.canRegister"
          autocomplete="username"
          label="Username"
          required
          variant="outlined"
        />
        <v-text-field
          v-model="form.password"
          :disabled="!authStore.canRegister"
          autocomplete="new-password"
          label="Password"
          required
          type="password"
          variant="outlined"
        />
        <div class="register-view__fields">
          <v-text-field
            v-model="form.firstName"
            :disabled="!authStore.canRegister"
            autocomplete="given-name"
            label="First name"
            required
            variant="outlined"
          />
          <v-text-field
            v-model="form.lastName"
            :disabled="!authStore.canRegister"
            autocomplete="family-name"
            label="Last name"
            required
            variant="outlined"
          />
        </div>
        <v-text-field
          v-model="form.email"
          :disabled="!authStore.canRegister"
          autocomplete="email"
          label="Email"
          required
          type="email"
          variant="outlined"
        />
        <v-text-field
          v-model="form.phoneNumber"
          :disabled="!authStore.canRegister"
          :error-messages="phoneError ? [phoneError] : []"
          :hint="`Optional · ${authStore.allowedPhoneCountryLabel} only`"
          autocomplete="tel"
          inputmode="tel"
          label="Phone number (optional)"
          persistent-hint
          type="tel"
          variant="outlined"
        />

        <app-button
          :disabled="!authStore.canRegister"
          :loading="isSubmitting"
          block
          icon="mdi-account-plus-outline"
          size="large"
          type="submit"
        >
          Create account
        </app-button>
        <app-button to="/login" tone="secondary" variant="tonal" icon="mdi-login">
          Back to sign in
        </app-button>
      </form>
    </app-card>
  </section>
</template>

<style scoped>
.register-view {
  display: grid;
  min-height: calc(100vh - (var(--space-5) * 2));
  place-items: center;
}

.register-view__panel {
  width: min(100%, 34rem);
}

.register-view__brand {
  display: grid;
  gap: var(--space-3);
  justify-items: center;
  text-align: center;
}

.register-view__logo {
  width: 4.75rem;
  height: 4.75rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
}

.register-view__brand h1 {
  margin: 0;
  font-size: clamp(1.7rem, 6vw, 2.4rem);
}

.register-view__brand p {
  margin: var(--space-1) 0 0;
  color: var(--color-muted);
}

.register-view__form {
  display: grid;
  gap: var(--space-3);
}

.register-view__disabled-alert {
  color: var(--color-primary-dark);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 36%, transparent);
}

.register-view__fields {
  display: grid;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .register-view__fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
