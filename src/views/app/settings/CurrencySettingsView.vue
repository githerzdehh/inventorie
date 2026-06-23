<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { useAppStore } from '@/stores/app'

interface CurrencyOption {
  code: string
  name: string
  country: string
  flag: string
  symbol: string
}

const appStore = useAppStore()
appStore.initializePreferences()

const defaultCurrency = 'USD'
const searchQuery = ref('')
const selectedCurrency = ref(appStore.currency)

const currencies: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', country: 'United States', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', country: 'European Union', flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', country: 'Canada', flag: '🇨🇦', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', flag: '🇦🇺', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', symbol: '¥' },
  { code: 'PHP', name: 'Philippine Peso', country: 'Philippines', flag: '🇵🇭', symbol: '₱' },
]

const filteredCurrencies = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return currencies
  }

  return currencies.filter((currency) =>
    [currency.code, currency.name, currency.country, currency.symbol].some((value) =>
      value.toLowerCase().includes(query),
    ),
  )
})

const activeCurrency = computed(
  () => currencies.find((currency) => currency.code === selectedCurrency.value) ?? currencies[0],
)

function saveCurrency() {
  appStore.setCurrency(selectedCurrency.value)
}

function resetCurrency() {
  selectedCurrency.value = defaultCurrency
  appStore.setCurrency(defaultCurrency)
}
</script>

<template>
  <section class="preference-view app-page app-stack">
    <div class="app-page-heading preference-view__heading">
      <app-button icon="mdi-arrow-left" size="small" tone="ghost" to="/app/settings" variant="tonal">
        Settings
      </app-button>
      <div>
        <p class="preference-view__eyebrow">App Currency</p>
        <h2>Choose your app currency</h2>
        <p>Set the currency used for totals, grocery budgets, and receipt summaries.</p>
      </div>
    </div>

    <v-text-field
      v-model="searchQuery"
      class="preference-view__search"
      clearable
      hide-details
      placeholder="Search Currencies..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <v-card class="preference-view__list" border elevation="0">
      <v-list bg-color="transparent" lines="two">
        <v-list-item
          v-for="currency in filteredCurrencies"
          :key="currency.code"
          :active="selectedCurrency === currency.code"
          class="preference-view__option"
          rounded="lg"
          @click="selectedCurrency = currency.code"
        >
          <template #prepend>
            <span class="preference-view__flag" aria-hidden="true">{{ currency.flag }}</span>
          </template>
          <v-list-item-title>
            <span class="preference-view__code">{{ currency.code }}</span>
            {{ currency.name }}
          </v-list-item-title>
          <v-list-item-subtitle>{{ currency.country }} · {{ currency.symbol }}</v-list-item-subtitle>
          <template #append>
            <v-icon v-if="selectedCurrency === currency.code" color="primary" icon="mdi-check-circle" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="preference-view__info" border elevation="0">
      <v-card-text>
        <p class="preference-view__eyebrow">Currency information</p>
        <h3>{{ activeCurrency.name }} ({{ activeCurrency.code }})</h3>
        <p>
          INVENTORIÉ will display new app totals with the {{ activeCurrency.symbol }} symbol.
          Historical receipt text remains unchanged so scanned records stay faithful to the original
          receipt.
        </p>
      </v-card-text>
    </v-card>

    <div class="preference-view__actions">
      <app-button block icon="mdi-content-save-outline" @click="saveCurrency">Save Currency</app-button>
      <app-button block icon="mdi-refresh" tone="ghost" variant="tonal" @click="resetCurrency">
        Reset to Default
      </app-button>
    </div>
  </section>
</template>

<style scoped>
.preference-view__heading {
  gap: var(--space-4);
}

.preference-view__eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preference-view__search :deep(.v-field),
.preference-view__list,
.preference-view__info {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.preference-view__option {
  margin: var(--space-2);
  border: 1px solid transparent;
}

.preference-view__option.v-list-item--active {
  background: var(--color-primary-soft);
  border-color: color-mix(in srgb, var(--color-primary) 24%, transparent);
  color: var(--color-primary-dark);
}

.preference-view__flag {
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 999px;
  background: var(--color-surface-soft);
  font-size: 1.6rem;
}

.preference-view__code {
  margin-right: var(--space-2);
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-bold);
}

.preference-view__info h3,
.preference-view__info p {
  margin: 0;
}

.preference-view__info :deep(.v-card-text) {
  display: grid;
  gap: var(--space-2);
}

.preference-view__actions {
  display: grid;
  gap: var(--space-3);
}
</style>
