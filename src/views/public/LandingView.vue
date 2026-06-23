<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'
import inventorieLogoUrl from '@/assets/logo/inventorie-logo.png'

const steps = [
  {
    title: 'Scan your groceries',
    description: 'Capture a grocery source image with a gentle mobile-first scanner.',
    icon: 'mdi-image-search-outline',
  },
  {
    title: 'Save groceries to your vault',
    description: 'Review detected groceries and keep freshness dates organized.',
    icon: 'mdi-safe-square-outline',
  },
  {
    title: 'Cook simple meals from what you have',
    description: 'Turn your saved pantry into practical recipe ideas.',
    icon: 'mdi-silverware-fork-knife',
  },
]
</script>

<template>
  <section class="landing-view app-page app-stack">
    <div class="landing-view__hero">
      <div class="app-page-heading">
        <div class="landing-view__brand-mark">
          <img class="landing-view__logo" :src="inventorieLogoUrl" alt="Inventorie" />
        </div>
        <h1>Inventorie</h1>
        <p>From scan to recipe, all in one vault.</p>
      </div>

      <div class="app-actions">
        <app-button to="/app/scan" icon="mdi-image-search-outline" size="large">
          Start scanning
        </app-button>
        <app-button to="/app/pantry" tone="secondary" variant="tonal" size="large">
          View pantry
        </app-button>
      </div>
    </div>

    <v-row>
      <v-col v-for="(step, index) in steps" :key="step.title" cols="12" md="4">
        <app-card
          :icon="step.icon"
          :title="`${index + 1}. ${step.title}`"
          :subtitle="step.description"
          tone="surface"
        />
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.landing-view {
  padding-block: var(--space-4) var(--space-8);
}

.landing-view__hero {
  display: grid;
  gap: var(--space-5);
  padding: var(--space-6) var(--space-4);
  background: linear-gradient(145deg, var(--color-surface) 0%, var(--color-surface-soft) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.landing-view__hero p {
  max-width: 36rem;
  margin: 0;
  color: var(--color-muted);
  font-size: 1.08rem;
}

.landing-view__brand-mark {
  width: fit-content;
  padding: var(--space-2);
  background: var(--color-primary-soft);
  border-radius: var(--radius-xl);
}

.landing-view__logo {
  width: 5rem;
  height: 5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

@media (min-width: 760px) {
  .landing-view__hero {
    padding: var(--space-8);
  }
}
</style>
