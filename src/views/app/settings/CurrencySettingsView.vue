<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { mockCurrencies } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
appStore.initializePreferences()

const defaultCurrency = 'PHP'
const searchQuery = ref('')
const selectedCurrency = ref(appStore.currency)

const filteredCurrencies = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return query
    ? mockCurrencies.filter((currency) =>
        [currency.code, currency.name, currency.symbol].some((value) =>
          value.toLowerCase().includes(query),
        ),
      )
    : mockCurrencies
})

function saveCurrency() {
  appStore.setCurrency(selectedCurrency.value)
}

function resetCurrency() {
  selectedCurrency.value = defaultCurrency
  appStore.setCurrency(defaultCurrency)
}
</script>

<template>
  <section class="preference-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>APP CURRENCY</h1>
    </header>

    <v-text-field
      v-model="searchQuery"
      class="preference-view__search"
      clearable
      hide-details
      placeholder="Search Currencies..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <div class="preference-view__list">
      <button
        v-for="currency in filteredCurrencies"
        :key="currency.code"
        class="preference-view__option"
        type="button"
        @click="selectedCurrency = currency.code"
      >
        <span class="preference-view__flag">{{ currency.flag }}</span>
        <strong>{{ currency.code }}</strong>
        <span>{{ currency.name }}</span>
        <v-icon v-if="selectedCurrency === currency.code" icon="mdi-check" />
      </button>
    </div>

    <section class="preference-view__info">
      <h2>Currency Information</h2>
      <ul>
        <li>This setting controls displayed currency for app prices and transactions.</li>
        <li>System default is based on your account region.</li>
        <li>This setting changes displayed currency labels for app prices and transactions.</li>
      </ul>
    </section>

    <div class="preference-view__actions">
      <app-button block @click="saveCurrency">Save Currency</app-button>
      <app-button block tone="ghost" variant="outlined" @click="resetCurrency">
        Reset to Default
      </app-button>
      <app-button icon="mdi-arrow-left" tone="ghost" to="/app/settings" variant="tonal">
        Back to settings
      </app-button>
    </div>
  </section>
</template>

<style scoped>
.preference-view {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-10);
}

.preference-view__search,
.preference-view__list,
.preference-view__info,
.preference-view__actions {
  margin-inline: var(--space-4);
}

.preference-view__search :deep(.v-field) {
  color: var(--color-primary);
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
}

.preference-view__list {
  overflow: hidden;
  background: var(--color-surface);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-lg);
}

.preference-view__option {
  display: grid;
  grid-template-columns: auto 3.5rem minmax(0, 1fr) auto;
  gap: var(--space-2);
  align-items: center;
  width: 100%;
  min-height: 2.5rem;
  padding: var(--space-2) var(--space-3);
  color: var(--color-primary);
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--color-primary);
}

.preference-view__option:last-child {
  border-bottom: 0;
}

.preference-view__flag {
  font-size: 1.5rem;
}

.preference-view__option strong {
  color: var(--color-primary-dark);
}

.preference-view__option span:nth-child(3) {
  overflow: hidden;
  color: var(--color-muted);
  font-weight: var(--font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preference-view__option :deep(.v-icon) {
  color: var(--color-primary);
  font-size: 2rem;
}

.preference-view__info {
  padding: var(--space-3);
  color: var(--color-text);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
}

.preference-view__info h2,
.preference-view__info ul {
  margin: 0;
}

.preference-view__info h2 {
  color: var(--color-text);
  font-size: 1.2rem;
}

.preference-view__actions {
  display: grid;
  gap: var(--space-2);
}
</style>
