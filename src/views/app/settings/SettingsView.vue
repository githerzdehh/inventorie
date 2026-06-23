<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import DeleteAccountDialog from './DeleteAccountDialog.vue'

const hasAcceptedTerms = ref(false)
</script>

<template>
  <section class="settings-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Settings</h2>
      <p>Review INVENTORIÉ account policies, terms, and privacy commitments.</p>
    </div>

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
              At INVENTORIÉ, we are committed to protecting your personal information and your right
              to privacy. This policy outlines how we collect, use, and safeguard your data when
              using our application.
            </p>
          </div>

          <div class="settings-view__privacy-block">
            <h4>📂 Data Collection</h4>
            <ul>
              <li>
                <strong>Account Information:</strong> We store your profile data, email address,
                name, and application preferences.
              </li>
              <li>
                <strong>Inventory Data:</strong> Custom ingredient names, quantities, and recipe
                logs are saved securely to sync across your devices.
              </li>
            </ul>
          </div>

          <div class="settings-view__privacy-block">
            <h4>🛡️ Data Usage &amp; Security</h4>
            <ul>
              <li>
                Your data is exclusively used to provide personalized notifications, restock
                reminders, and smart budget meal tips.
              </li>
              <li>
                We do not sell, trade, or share your personal data with third-party advertising
                networks.
              </li>
            </ul>
          </div>

          <div class="settings-view__privacy-block">
            <h4>⚙️ Your Rights &amp; Choices</h4>
            <p>
              You have full control over your data. You can export your inventory logs or permanently
              delete your account and all associated records at any time via the account settings
              menu.
            </p>
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
  color: var(--color-text);
}

.settings-view__section {
  display: grid;
  gap: var(--space-2);
}

.settings-view__section h3,
.settings-view__privacy-block h4 {
  margin: 0;
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-bold);
  line-height: 1.25;
}

.settings-view__section p,
.settings-view__section ul {
  margin-block: 0;
}

.settings-view__section ul {
  display: grid;
  gap: var(--space-1);
  padding-inline-start: var(--space-6);
}

.settings-view__section a {
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  text-decoration: underline;
}

.settings-view__privacy {
  padding: var(--space-5);
  background: var(--color-secondary-soft);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 40%, transparent);
  border-radius: var(--radius-lg);
}

.settings-view__eyebrow {
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.settings-view__privacy-block {
  display: grid;
  gap: var(--space-2);
}

.settings-view__agreement :deep(.v-selection-control) {
  align-items: flex-start;
}

.settings-view__continue {
  margin-top: var(--space-4);
}

@media (min-width: 760px) {
  .settings-view__preference-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
