<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DeleteAccountDialog from '@/views/app/settings/DeleteAccountDialog.vue'
import { mockCurrencies, mockLanguages } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'

interface SettingsRow {
  label: string
  icon: string
  to?: string
  value?: string
  tone?: 'default' | 'danger'
  action?: () => void | Promise<void>
}

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const scannerStore = useScannerStore()
appStore.initializePreferences()

const showConsentMessage = ref(false)

const selectedLanguageLabel = computed(
  () => mockLanguages.find((language) => language.code === appStore.language)?.label ?? 'English',
)
const selectedCurrencyLabel = computed(() => {
  const currency = mockCurrencies.find((item) => item.code === appStore.currency)

  return currency ? `${currency.code} (${currency.symbol})` : 'PHP (₱)'
})
const dataSharingConsent = computed({
  get: () => appStore.dataSharingConsent,
  set: (value: boolean) => {
    appStore.setDataSharingConsent(value)
    showConsentMessage.value = true
  },
})

const rows = computed<SettingsRow[]>(() => [
  {
    label: 'Terms and Conditions',
    icon: 'mdi-file-document-check-outline',
    to: '/app/settings/terms',
  },
  {
    label: 'Privacy Policy',
    icon: 'mdi-shield-check-outline',
    to: '/app/settings/privacy',
  },
  {
    label: 'Report bugs',
    icon: 'mdi-bug-outline',
    to: '/app/support',
  },
  {
    label: 'Request a feature',
    icon: 'mdi-lightbulb-on-outline',
    to: '/app/support',
  },
  {
    label: 'Help or Contact Support',
    icon: 'mdi-headset',
    to: '/app/support',
  },
  {
    label: 'Language',
    icon: 'mdi-web',
    to: '/app/settings/language',
    value: selectedLanguageLabel.value,
  },
  {
    label: 'Currency',
    icon: 'mdi-cash-multiple',
    to: '/app/settings/currency',
    value: selectedCurrencyLabel.value,
  },
  ...(authStore.isSuperAdmin
    ? [
        {
          label: 'Users',
          icon: 'mdi-account-group-outline',
          to: '/app/users',
          value: 'Super Admin',
        },
      ]
    : []),
  {
    label: 'Log out',
    icon: 'mdi-logout',
    action: signOut,
  },
])

async function signOut() {
  scannerStore.setDiagnosticsEnabled(false)
  scannerStore.clearDebugEvents()
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <section class="settings-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>SETTINGS</h1>
    </header>

    <div class="settings-view__content">
      <div class="settings-view__quick-grid">
        <router-link class="settings-card settings-card--feature" to="/app/notifications">
          <v-icon icon="mdi-bell-outline" />
          <span>Notifications</span>
          <v-icon icon="mdi-chevron-right" />
        </router-link>
        <router-link class="settings-card settings-card--feature" to="/app/plan">
          <v-icon icon="mdi-qrcode" />
          <span>Your Plan</span>
          <v-icon icon="mdi-chevron-right" />
        </router-link>
      </div>

      <div class="settings-card settings-card--toggle">
        <div class="settings-card__label">
          <v-icon icon="mdi-file-sync-outline" />
          <span>Toggle data sharing/Data consent</span>
        </div>
        <v-switch
          v-model="dataSharingConsent"
          aria-label="Toggle data sharing data consent"
          color="success"
          hide-details
          inset
        />
      </div>

      <div class="settings-view__rows">
        <template v-for="row in rows" :key="row.label">
          <router-link v-if="row.to" class="settings-card settings-card--row" :to="row.to">
            <span class="settings-card__label">
              <v-icon :icon="row.icon" />
              <span>{{ row.label }}</span>
            </span>
            <span class="settings-card__meta">
              <span v-if="row.value">{{ row.value }}</span>
              <v-icon icon="mdi-chevron-right" />
            </span>
          </router-link>
          <button v-else class="settings-card settings-card--row" type="button" @click="row.action?.()">
            <span class="settings-card__label">
              <v-icon :icon="row.icon" />
              <span>{{ row.label }}</span>
            </span>
            <v-icon icon="mdi-chevron-right" />
          </button>
        </template>
      </div>

      <delete-account-dialog />
    </div>

    <v-snackbar v-model="showConsentMessage" timeout="1600">
      Data consent {{ appStore.dataSharingConsent ? 'enabled' : 'disabled' }} for this browser.
    </v-snackbar>
  </section>
</template>

<style scoped>
.settings-view {
  min-height: 100vh;
  padding-bottom: var(--space-10);
}

.settings-view__content {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-6) var(--space-4);
}

.settings-view__quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.settings-view__rows {
  display: grid;
  gap: var(--space-4);
}

.settings-card {
  display: grid;
  align-items: center;
  min-height: 3.25rem;
  padding: var(--space-3);
  color: var(--color-primary);
  background: var(--color-surface);
  border: 0;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  font-weight: var(--font-weight-bold);
  text-align: left;
}

.settings-card--feature,
.settings-card--row {
  grid-template-columns: minmax(0, 1fr) auto;
}

.settings-card--feature {
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-2);
}

.settings-card--toggle {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-3);
}

.settings-card__label,
.settings-card__meta {
  display: inline-flex;
  min-width: 0;
  gap: var(--space-2);
  align-items: center;
}

.settings-card__label span,
.settings-card__meta span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-card__meta {
  justify-self: end;
  color: var(--color-primary);
  font-weight: var(--font-weight-regular);
}

.settings-view :deep(.delete-account-dialog__danger-card) {
  border-color: #cf121b !important;
}
</style>
