<template>
  <section class="legal-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>PRIVACY</h1>
    </header>

    <v-card class="legal-view__card" border elevation="0">
      <v-card-text class="legal-view__content">
        <h2>Your Privacy Matters</h2>
        <p>
          INVENTORIÉ keeps account records, preferences, support drafts, comparison state, pantry
          data, and scan history in local browser storage unless you clear or delete them.
        </p>
        <h3>Data Stored Locally</h3>
        <ul>
          <li>Auth users and session state.</li>
          <li>Pantry items and scan records.</li>
          <li>Language, currency, consent, plan, and comparison preferences.</li>
          <li>Support submissions saved in this browser.</li>
        </ul>
        <h3>No External Delivery</h3>
        <p>
          Support forms and plan buttons are handled inside this app session unless a connected
          service is configured.
        </p>
        <h3>Your Choices</h3>
        <p>
          You can update preferences, pause comparison, log out, or delete a non-super-admin account
          from settings.
        </p>
      </v-card-text>
    </v-card>

    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/settings" variant="tonal">
      Back to settings
    </app-button>
  </section>
</template>

<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
</script>

<style scoped>
.legal-view {
  display: grid;
  gap: var(--space-5);
}

.legal-view__card {
  background: var(--color-surface);
  border-color: var(--color-primary);
  border-radius: var(--radius-xl);
}

.legal-view__content {
  display: grid;
  gap: var(--space-3);
  color: var(--color-text);
}

.legal-view h2,
.legal-view h3,
.legal-view p,
.legal-view ul {
  margin: 0;
}

.legal-view h2,
.legal-view h3 {
  color: var(--color-primary);
}
</style>
