<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { mockPlanFeatures, mockPlans } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const appStore = useAppStore()
const authStore = useAuthStore()
appStore.initializePreferences()

const showSubscribeMessage = ref(false)
const selectedPlanLabel = ref('')

function selectPlan(planId: string) {
  const plan = mockPlans.find((item) => item.id === planId)

  appStore.setSelectedPlan(planId)
  selectedPlanLabel.value = plan ? `${plan.name} ${plan.price}` : 'Selected plan'
  showSubscribeMessage.value = true
}
</script>

<template>
  <section class="plan-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>YOUR PLAN</h1>
    </header>

    <section class="plan-view__profile">
      <div class="plan-view__avatar">{{ authStore.currentUser?.firstName?.charAt(0) ?? 'I' }}</div>
      <div>
        <h2>{{ authStore.currentUser?.firstName?.toLowerCase() ?? 'inventorie' }}</h2>
        <p>your current plan:</p>
        <strong>{{
          appStore.selectedPlanId === 'basic-free' ? 'free trial' : 'active subscription'
        }}</strong>
      </div>
    </section>

    <section class="plan-view__comparison">
      <div class="plan-view__comparison-head">
        <strong>BASIC</strong>
        <strong>UNBASIC</strong>
      </div>
      <div class="plan-view__feature-table">
        <div
          v-for="feature in mockPlanFeatures"
          :key="feature.label"
          class="plan-view__feature-row"
        >
          <span :class="{ 'plan-view__missing': !feature.basic }">{{
            feature.basic ? '✓' : 'X'
          }}</span>
          <strong>{{ feature.label }}</strong>
          <span>{{ feature.unbasic ? '✓' : 'X' }}</span>
        </div>
      </div>
    </section>

    <div class="plan-view__plans">
      <button
        v-for="plan in mockPlans"
        :key="plan.id"
        class="plan-view__plan-card"
        :class="{
          'plan-view__plan-card--active': appStore.selectedPlanId === plan.id,
          'plan-view__plan-card--featured': plan.featured,
        }"
        type="button"
        @click="selectPlan(plan.id)"
      >
        <span>{{ plan.name }}</span>
        <strong>{{ plan.price }}</strong>
        <small>{{ plan.cadence }}</small>
        <em>{{ plan.cta }}</em>
      </button>
    </div>

    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/settings" variant="tonal">
      Back to settings
    </app-button>

    <v-snackbar v-model="showSubscribeMessage" timeout="1800">
      {{ selectedPlanLabel }} selected.
    </v-snackbar>
  </section>
</template>

<style scoped>
.plan-view {
  display: grid;
  gap: var(--space-6);
  padding-bottom: var(--space-10);
}

.plan-view__profile {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-5);
  align-items: center;
  padding: var(--space-8) var(--space-5);
  background: linear-gradient(155deg, var(--color-secondary), var(--color-accent));
  border-radius: 48px 48px 0 0;
}

.plan-view__avatar {
  display: grid;
  width: 6rem;
  height: 6rem;
  place-items: center;
  color: var(--color-secondary);
  background: var(--color-primary);
  border: 6px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: -14px 12px 0 rgba(248, 166, 13, 0.35);
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
}

.plan-view h2,
.plan-view__profile p,
.plan-view__profile strong {
  margin: 0;
}

.plan-view h2 {
  color: var(--color-primary);
  font-size: 2rem;
  line-height: 1;
  text-shadow: 0.12em 0.12em 0 rgba(248, 166, 13, 0.55);
}

.plan-view__profile p,
.plan-view__profile strong {
  color: var(--color-secondary-soft);
  font-size: 1rem;
}

.plan-view__comparison {
  overflow: hidden;
  margin-top: -2rem;
  background: var(--color-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
}

.plan-view__comparison-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: var(--space-3) var(--space-6);
  color: var(--color-secondary);
  font-size: 1.5rem;
  text-align: center;
}

.plan-view__feature-table {
  display: grid;
  margin: 0 var(--space-4) var(--space-5);
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-xl);
}

.plan-view__feature-row {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) 3.5rem;
  align-items: center;
  min-height: 2rem;
  color: var(--color-primary);
  border-bottom: 1px solid color-mix(in srgb, var(--color-secondary) 42%, transparent);
  text-align: center;
}

.plan-view__feature-row strong {
  font-size: 0.75rem;
}

.plan-view__feature-row span {
  color: #009f44;
  font-size: 1.1rem;
}

.plan-view__feature-row .plan-view__missing {
  color: #ff2633;
}

.plan-view__plans {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.plan-view__plan-card {
  display: grid;
  justify-items: center;
  padding: var(--space-2);
  color: var(--color-primary);
  background: var(--color-bg);
  border: 0;
  border-radius: var(--radius-lg);
  box-shadow:
    0 0 0 3px rgba(248, 166, 13, 0.6),
    var(--shadow-soft);
  cursor: pointer;
}

.plan-view__plan-card--active {
  outline: 3px solid var(--color-primary);
}

.plan-view__plan-card span,
.plan-view__plan-card em {
  font-weight: var(--font-weight-bold);
}

.plan-view__plan-card strong {
  font-size: 1.8rem;
  line-height: 1;
}

.plan-view__plan-card small {
  color: var(--color-muted);
}

.plan-view__plan-card em {
  color: var(--color-secondary);
  font-style: normal;
}

@media (max-width: 520px) {
  .plan-view__plans {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
