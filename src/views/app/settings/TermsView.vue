<template>
  <section class="legal-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>TERMS</h1>
    </header>

    <v-card class="legal-view__card" border elevation="0">
      <v-card-text class="legal-view__content">
        <p><strong>Last Updated: June 20, 2026</strong></p>
        <h2>Terms and Conditions for INVENTORIÉ</h2>
        <p>
          By accessing or using INVENTORIÉ, you agree to use the grocery scanning, inventory,
          recipe, and settings features responsibly.
        </p>
        <h3>1. Account Use</h3>
        <p>
          You are responsible for account details saved in this browser. Account and inventory
          records are stored locally on this device unless the app is connected to a sync service.
        </p>
        <h3>2. Scan Accuracy</h3>
        <p>
          OCR results may contain errors. Always review detected grocery items, quantities, and
          expiry estimates before saving them.
        </p>
        <h3>3. Pantry And Recipe Data</h3>
        <p>
          Pantry, recipe, comparison, language, currency, support, and plan data are provided for
          personal organization and may differ from actual grocery labels or store records.
        </p>
        <h3>4. Subscriptions</h3>
        <p>
          Plan details shown in the app are for account preference management. Review any separate
          billing terms before making payment decisions.
        </p>
        <h3>5. Changes</h3>
        <p>INVENTORIÉ content and features may change as the app improves.</p>
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
.legal-view p {
  margin: 0;
}

.legal-view h2,
.legal-view h3 {
  color: var(--color-primary);
}
</style>
