<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScannerStore } from '@/stores/scanner'
import { ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import DeleteAccountDialog from './DeleteAccountDialog.vue'

const preferencesStorageKey = 'inventorie:user-preferences'

interface UserPreferences {
  dataSharingConsent: boolean
  language: string
  currency: string
}

interface SettingsAction {
  label: string
  icon: string
  value?: string
  tone?: 'default' | 'danger'
  action?: () => void | Promise<void>
}

const defaultPreferences: UserPreferences = {
  dataSharingConsent: false,
  language: 'English',
  currency: 'Php (₱)',
}

const router = useRouter()
const authStore = useAuthStore()
const scannerStore = useScannerStore()

const selectedLegalDialog = ref<'terms' | 'privacy' | null>(null)
const preferences = ref<UserPreferences>(loadPreferences())

const hasDataSharingConsent = computed({
  get: () => preferences.value.dataSharingConsent,
  set: (value: boolean) => {
    preferences.value = {
      ...preferences.value,
      dataSharingConsent: value,
    }
  },
})

const isLegalDialogOpen = computed({
  get: () => selectedLegalDialog.value !== null,
  set: (isOpen: boolean) => {
    if (!isOpen) {
      selectedLegalDialog.value = null
    }
  },
})

const legalDialogTitle = computed(() =>
  selectedLegalDialog.value === 'privacy' ? 'Privacy Policy' : 'Terms and Conditions',
)

const shortcutRows = computed<SettingsAction[]>(() => [
  {
    label: 'Terms and Conditions',
    icon: 'mdi-file-document-outline',
    action: () => openLegalDialog('terms'),
  },
  {
    label: 'Privacy Policy',
    icon: 'mdi-shield-lock-outline',
    action: () => openLegalDialog('privacy'),
  },
  {
    label: 'Report bugs',
    icon: 'mdi-bug-outline',
    action: () => openMailLink('Bug report'),
  },
  {
    label: 'Request a feature',
    icon: 'mdi-lightbulb-on-outline',
    action: () => openMailLink('Feature request'),
  },
  {
    label: 'Help or Contact Support',
    icon: 'mdi-face-agent',
    action: () => openMailLink('Support request'),
  },
  {
    label: 'Language',
    icon: 'mdi-translate',
    value: preferences.value.language,
  },
  {
    label: 'Currency',
    icon: 'mdi-cash-multiple',
    value: preferences.value.currency,
  },
  {
    label: 'Log out',
    icon: 'mdi-logout',
    action: signOut,
  },
  {
    label: 'Delete account',
    icon: 'mdi-delete-outline',
    tone: 'danger',
  },
])

watch(
  preferences,
  (nextPreferences) => {
    savePreferences(nextPreferences)
  },
  { deep: true },
)

function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...defaultPreferences }
  }

  try {
    const rawPreferences = window.localStorage.getItem(preferencesStorageKey)

    if (!rawPreferences) {
      return { ...defaultPreferences }
    }

    const parsedPreferences = JSON.parse(rawPreferences) as Partial<UserPreferences>

    return {
      dataSharingConsent: Boolean(parsedPreferences.dataSharingConsent),
      language: parsedPreferences.language || defaultPreferences.language,
      currency: parsedPreferences.currency || defaultPreferences.currency,
    }
  } catch {
    window.localStorage.removeItem(preferencesStorageKey)
    return { ...defaultPreferences }
  }
}

function savePreferences(nextPreferences: UserPreferences) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(preferencesStorageKey, JSON.stringify(nextPreferences))
}

function openLegalDialog(dialog: 'terms' | 'privacy') {
  selectedLegalDialog.value = dialog
}

function openMailLink(subject: string) {
  window.location.href = `mailto:Inventorie@gmail.com?subject=${encodeURIComponent(subject)}`
}

async function signOut() {
  scannerStore.setDiagnosticsEnabled(false)
  scannerStore.clearDebugEvents()
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <section class="settings-view">
    <header class="settings-view__hero">
      <p class="settings-view__brand">INVENTORIÉ</p>
      <h1>SETTINGS</h1>
    </header>

    <div class="settings-view__content">
      <div class="settings-view__quick-grid" aria-label="Featured settings">
        <button class="settings-card settings-card--feature" type="button">
          <v-icon icon="mdi-bell-outline" />
          <span>Notifications</span>
        </button>
        <button class="settings-card settings-card--feature" type="button">
          <v-icon icon="mdi-crown-outline" />
          <span>Your Plan</span>
        </button>
      </div>

      <div class="settings-card settings-card--toggle">
        <div class="settings-card__copy">
          <span>Toggle data sharing</span>
          <small>Data consent</small>
        </div>
        <v-switch
          v-model="hasDataSharingConsent"
          aria-label="Toggle data sharing data consent"
          color="#1f5f99"
          hide-details
          inset
        />
      </div>

      <div class="settings-view__shortcuts" aria-label="Settings shortcuts">
        <button
          v-for="row in shortcutRows"
          :key="row.label"
          class="settings-card settings-card--row"
          :class="{ 'settings-card--danger': row.tone === 'danger' }"
          type="button"
          @click="row.action?.()"
        >
          <span class="settings-card__label">
            <v-icon :icon="row.icon" />
            <span>{{ row.label }}</span>
          </span>
          <span class="settings-card__meta">
            <span v-if="row.value">{{ row.value }}</span>
            <v-icon v-else icon="mdi-chevron-right" />
          </span>
        </button>
      </div>
    </div>

    <v-dialog v-model="isLegalDialogOpen" max-width="720">
      <v-card class="settings-view__dialog">
        <v-card-title>{{ legalDialogTitle }}</v-card-title>
        <v-card-text class="settings-view__legal-copy">
          <template v-if="selectedLegalDialog === 'terms'">
            <p><strong>Last Updated: June 20, 2026</strong></p>
    <div class="settings-view__preference-grid">
      <v-card class="settings-view__preference-card" border elevation="0">
        <v-card-item>
          <template #prepend>
            <v-avatar class="settings-view__icon" size="44">
              <v-icon icon="mdi-translate" />
            </v-avatar>
          </template>
          <v-card-title>App Language</v-card-title>
          <v-card-subtitle>Choose labels, menus, and guidance language.</v-card-subtitle>
        </v-card-item>
        <v-card-actions>
          <app-button
            block
            append-icon="mdi-chevron-right"
            to="/app/settings/language"
            variant="tonal"
          >
            Manage Language
          </app-button>
        </v-card-actions>
      </v-card>

      <v-card class="settings-view__preference-card" border elevation="0">
        <v-card-item>
          <template #prepend>
            <v-avatar class="settings-view__icon" size="44">
              <v-icon icon="mdi-currency-usd" />
            </v-avatar>
          </template>
          <v-card-title>App Currency</v-card-title>
          <v-card-subtitle>Choose totals, budgets, and receipt summary currency.</v-card-subtitle>
        </v-card-item>
        <v-card-actions>
          <app-button
            block
            append-icon="mdi-chevron-right"
            to="/app/settings/currency"
            variant="tonal"
          >
            Manage Currency
          </app-button>
        </v-card-actions>
      </v-card>

      <v-card class="settings-view__preference-card" border elevation="0">
        <v-card-item>
          <template #prepend>
            <v-avatar class="settings-view__icon" size="44">
              <v-icon icon="mdi-bell-outline" />
            </v-avatar>
          </template>
          <v-card-title>Notifications</v-card-title>
          <v-card-subtitle>Review activity and unread updates.</v-card-subtitle>
        </v-card-item>
        <v-card-actions>
          <app-button
            block
            append-icon="mdi-chevron-right"
            to="/app/notifications"
            variant="tonal"
          >
            View Notifications
          </app-button>
        </v-card-actions>
      </v-card>
    </div>

    <v-card class="settings-view__legal-card" border elevation="0">
      <v-card-item>
        <template #prepend>
          <v-avatar class="settings-view__icon" size="44">
            <v-icon icon="mdi-file-document-check-outline" />
          </v-avatar>
        </template>
        <v-card-title>Terms and Conditions for INVENTORIÉ</v-card-title>
        <v-card-subtitle>Last Updated: June 20, 2026</v-card-subtitle>
      </v-card-item>

      <v-card-text class="settings-view__content app-stack--compact">
        <p>
          Welcome to INVENTORIÉ! By downloading, accessing, or using this App, you agree to comply
          with and be bound by the following Terms and Conditions. If you do not agree with these
          terms, please do not use the App.
        </p>

        <section class="settings-view__section">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By using this app, you acknowledge that you have read, understood, and agreed to these
            Terms and Conditions and our Privacy Policy.
          </p>
        </section>

        <section class="settings-view__section">
          <h3>2. Purpose of the App</h3>
          <p>The INVENTORIÉ App is designed to:</p>
          <ul>
            <li>Scan and digitize grocery receipts.</li>
            <li>Organize and store receipt information.</li>
            <li>Track grocery expenses and purchase history.</li>
            <li>Generate reports and summaries based on scanned receipts.</li>
          </ul>
          <p>The App is intended for informational and personal financial management purposes only.</p>
        </section>

        <section class="settings-view__section">
          <h3>3. User Responsibilities</h3>
          <p>By using the App, you agree to:</p>
          <ul>
            <li>Provide accurate information when creating an account.</li>
            <li>Use the App only for lawful purposes.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>
              Ensure that receipts uploaded or scanned belong to you or that you have permission to
              use them.
            </li>
          </ul>
          <p>You must not:</p>
          <ul>
            <li>Use the App for fraudulent or illegal activities.</li>
            <li>Upload malicious software, viruses, or harmful content.</li>
            <li>Attempt to gain unauthorized access to the App or its systems.</li>
            <li>Copy, modify, reverse engineer, or distribute the App without authorization.</li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>4. Receipt Data and Accuracy</h3>
          <p>
            The App uses optical character recognition (OCR) and automated technologies to extract
            information from receipts.
          </p>
          <p>While we strive to provide accurate results:</p>
          <ul>
            <li>We do not guarantee that all scanned information will be error-free.</li>
            <li>Users are responsible for reviewing and verifying scanned data.</li>
            <li>We are not liable for financial decisions made based on inaccurate receipt data.</li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>5. Privacy and Data Collection</h3>
          <p>The App may collect and process:</p>
          <ul>
            <li>Receipt images uploaded by users.</li>
            <li>Purchase information extracted from receipts.</li>
            <li>Device and usage data necessary for App functionality.</li>
          </ul>
          <p>
            We will handle personal information in accordance with our Privacy Policy and applicable
            data protection laws.
          </p>
        </section>

        <section class="settings-view__section">
          <h3>6. User Content</h3>
          <p>Users retain ownership of the receipt images and information they upload.</p>
          <p>By uploading content, you grant us a non-exclusive, limited license to:</p>
          <ul>
            <li>Process receipt data for App functionality.</li>
            <li>Store and display your receipts within your account.</li>
            <li>Improve scanning accuracy and App performance where permitted by law.</li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>7. Data Storage and Backup</h3>
          <p>
            We may store receipt data on secure servers or local devices depending on the App
            configuration.
          </p>
          <p>Users are responsible for:</p>
          <ul>
            <li>Maintaining copies of important receipts.</li>
            <li>Exporting or backing up data when necessary.</li>
          </ul>
          <p>We do not guarantee permanent storage of receipt records.</p>
        </section>

        <section class="settings-view__section">
          <h3>8. Intellectual Property</h3>
          <p>
            All trademarks, logos, software, designs, features, and content associated with the App
            are the property of the App owner or licensors and are protected by intellectual property
            laws.
          </p>
          <p>
            Users may not reproduce, distribute, or create derivative works without written
            permission.
          </p>
        </section>

        <section class="settings-view__section">
          <h3>9. Limitation of Liability</h3>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>The App is provided on an “as is” and “as available” basis.</li>
            <li>We make no warranties regarding uninterrupted operation or error-free performance.</li>
            <li>
              We are not responsible for any direct, indirect, incidental, consequential, or special
              damages arising from the use of the App.
            </li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>10. Third-Party Services</h3>
          <p>
            The App may integrate with third-party services such as cloud storage, analytics, or
            payment providers.
          </p>
          <p>We are not responsible for:</p>
          <ul>
            <li>The content or practices of third-party services.</li>
            <li>Any loss or damage resulting from the use of such services.</li>
          </ul>
          <p>Users should review the terms and policies of those third parties.</p>
        </section>

        <section class="settings-view__section">
          <h3>11. Account Suspension or Termination</h3>
          <p>We reserve the right to suspend or terminate access to the App if:</p>
          <ul>
            <li>Users violate these Terms and Conditions.</li>
            <li>Fraudulent, abusive, or illegal activity is detected.</li>
            <li>Continued access poses a risk to the App or other users.</li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>12. Updates and Modifications</h3>
          <p>
            We may update, modify, or discontinue any feature of the App at any time without prior
            notice.
          </p>
          <p>
            Continued use of the App after updates constitutes acceptance of the revised Terms and
            Conditions.
          </p>
        </section>

        <section class="settings-view__section">
          <h3>13. Governing Law</h3>
          <p>
            These Terms and Conditions shall be governed and interpreted in accordance with the laws
            of the jurisdiction where the App operator is established, without regard to conflict of
            law principles.
          </p>
        </section>

        <section class="settings-view__section">
          <h3>14. Contact Information</h3>
          <p>For questions, concerns, or requests regarding these Terms and Conditions, please contact:</p>
          <ul>
            <li>Email: <a href="mailto:Inventorie@gmail.com">Inventorie@gmail.com</a></li>
            <li>Business Name: INVENTORIÉ</li>
          </ul>
        </section>

        <section class="settings-view__section">
          <h3>15. Agreement</h3>
          <p>
            By using the INVENTORIÉ App, you acknowledge that you have read, understood, and agreed
            to these Terms and Conditions.
          </p>
        </section>

        <v-divider />

        <section class="settings-view__section settings-view__privacy">
          <p class="settings-view__eyebrow">Privacy Policy</p>
          <h3>PRIVACY POLICY</h3>

          <div class="settings-view__privacy-block">
            <h4>🔒 Your Privacy Matters</h4>
            <p>
              Welcome to INVENTORIÉ! By downloading, accessing, or using this App, you agree to
              comply with and be bound by these Terms and Conditions. If you do not agree, please do
              not use the App.
            </p>
            <h3>1. Acceptance of Terms</h3>
            <p>
              By using this app, you acknowledge that you have read, understood, and agreed to these
              Terms and Conditions and our Privacy Policy.
            </p>
            <h3>2. Purpose of the App</h3>
            <p>
              INVENTORIÉ scans and digitizes grocery receipts, organizes receipt information, tracks
              grocery expenses and purchase history, and generates reports for personal financial
              management.
            </p>
            <h3>3. User Responsibilities</h3>
            <p>
              You agree to provide accurate account information, use the App lawfully, keep account
              credentials confidential, and upload receipts you own or have permission to use.
            </p>
            <h3>4. Receipt Data and Accuracy</h3>
            <p>
              OCR and automated extraction may contain errors. Users are responsible for reviewing
              scanned data and any decisions based on it.
            </p>
            <h3>5. Privacy, Storage, and User Content</h3>
            <p>
              Receipt images, extracted purchases, device data, and preferences may be processed to
              provide App functionality. Users retain ownership of uploaded receipt content and grant
              INVENTORIÉ a limited license to process, store, display, and improve receipt scanning.
            </p>
            <h3>6. Intellectual Property and Third-Party Services</h3>
            <p>
              INVENTORIÉ trademarks, designs, software, and features are protected. The App may use
              third-party services, whose own terms and policies apply.
            </p>
            <h3>7. Account Termination, Updates, and Liability</h3>
            <p>
              Access may be suspended for violations or risky activity. The App is provided “as is,”
              may change over time, and liability is limited to the maximum extent permitted by law.
            </p>
            <h3>8. Contact Information</h3>
            <p>Email: <a href="mailto:Inventorie@gmail.com">Inventorie@gmail.com</a></p>
          </template>

          <template v-else>
            <h3>🔒 Your Privacy Matters</h3>
            <p>
              At INVENTORIÉ, we are committed to protecting your personal information and your right
              to privacy when using our application.
            </p>
            <h3>📂 Data Collection</h3>
            <ul>
              <li>Account information, including profile data, email address, name, and preferences.</li>
              <li>Inventory data, custom ingredient names, quantities, and recipe logs.</li>
            </ul>
            <h3>🛡️ Data Usage &amp; Security</h3>
            <ul>
              <li>
                Your data is used to provide personalized notifications, restock reminders, and smart
                budget meal tips.
              </li>
              <li>We do not sell, trade, or share personal data with advertising networks.</li>
            </ul>
            <h3>⚙️ Your Rights &amp; Choices</h3>
            <p>
              You can control your data, export inventory logs, or permanently delete your account and
              associated records through account settings.
            </p>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="selectedLegalDialog = null">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
          </div>
        </section>
      </v-card-text>
    </v-card>

    <delete-account-dialog />

    <v-card class="settings-view__agreement" border elevation="0">
      <v-card-text>
        <v-checkbox
          v-model="hasAcceptedTerms"
          color="primary"
          hide-details
          label="I Agree with all the terms and Condition Above"
        />
        <app-button
          block
          class="settings-view__continue"
          :disabled="!hasAcceptedTerms"
          icon="mdi-arrow-right"
          to="/app/scan"
        >
          Continue to the App
        </app-button>
      </v-card-text>
    </v-card>
  </section>
</template>

<style scoped>
.settings-view {
  min-height: calc(100vh - var(--bottom-navigation-height));
  margin: calc(var(--space-4) * -1);
  padding: var(--space-4) var(--space-4) calc(var(--space-8) + var(--safe-area-bottom));
  background:
    radial-gradient(circle at 18% 8%, rgba(255, 255, 255, 0.42), transparent 24rem),
    #f4c84a;
}

.settings-view__hero {
  display: grid;
  justify-items: center;
  gap: var(--space-1);
  padding: var(--space-6) var(--space-2) var(--space-5);
  text-align: center;
}

.settings-view__brand {
  margin: 0;
  color: #1f5f99;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.settings-view__hero h1 {
  margin: 0;
  color: #245f95;
  font-size: clamp(3rem, 16vw, 5.8rem);
  font-weight: 1000;
  letter-spacing: 0.02em;
  line-height: 0.9;
  text-shadow: 0 6px 0 #fff3d0, 0 10px 18px rgba(31, 95, 153, 0.28);
.settings-view__preference-grid {
  display: grid;
  gap: var(--space-3);
}

.settings-view__legal-card,
.settings-view__agreement,
.settings-view__preference-card {
  background: var(--color-surface);
}

.settings-view__preference-card :deep(.v-card-actions) {
  padding: 0 var(--space-4) var(--space-4);
}

.settings-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.settings-view__content {
  display: grid;
  max-width: 720px;
  margin-inline: auto;
  gap: var(--space-3);
}

.settings-view__quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.settings-view__shortcuts {
  display: grid;
  gap: var(--space-2);
}

.settings-card {
  width: 100%;
  color: #1f5f99;
  background: #fff4d6;
  border: 2px solid #2a6497;
  border-radius: 18px;
  box-shadow: 0 5px 0 #255f91, 0 12px 22px rgba(86, 63, 10, 0.18);
  font: inherit;
}

button.settings-card {
  cursor: pointer;
}

button.settings-card:focus-visible {
  outline: 3px solid #ffffff;
  outline-offset: 3px;
}

.settings-card--feature {
  display: grid;
  min-height: 86px;
  place-items: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-2);
  font-size: 0.95rem;
  font-weight: 900;
}

.settings-card--feature .v-icon {
  font-size: 2rem;
}

.settings-card--toggle,
.settings-card--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 58px;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  text-align: left;
}

.settings-card__copy,
.settings-card__label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--space-3);
  font-weight: 900;
}

.settings-card__copy {
  display: grid;
  gap: 0;
}

.settings-card__copy small {
  color: rgba(31, 95, 153, 0.78);
  font-size: 0.78rem;
  font-weight: 800;
}

.settings-card__label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-card__meta {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  color: rgba(31, 95, 153, 0.78);
  font-size: 0.9rem;
  font-weight: 900;
}

.settings-card--danger {
  color: #b42318;
  border-color: #b42318;
  box-shadow: 0 5px 0 #8f1d14, 0 12px 22px rgba(86, 20, 10, 0.18);
}

.settings-card--danger .settings-card__meta {
  color: #b42318;
}

.settings-view__dialog {
  background: #fff9e8;
  border: 2px solid #2a6497;
  border-radius: 24px !important;
}

.settings-view__dialog :deep(.v-card-title) {
  color: #1f5f99;
  font-weight: 1000;
}

.settings-view__legal-copy {
  display: grid;
  gap: var(--space-3);
  max-height: 68vh;
  color: var(--color-text);
  overflow-y: auto;
}

.settings-view__legal-copy h3,
.settings-view__legal-copy p,
.settings-view__legal-copy ul {
  margin: 0;
}

.settings-view__legal-copy h3,
.settings-view__legal-copy a {
  color: #1f5f99;
}

@media (min-width: 760px) {
  .settings-view {
    margin: calc(var(--space-8) * -1) calc(var(--space-5) * -1);
    padding-top: var(--space-8);
  }
}

@media (min-width: 760px) {
  .settings-view__preference-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
