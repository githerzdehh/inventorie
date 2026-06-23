<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { mockLanguages } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
appStore.initializePreferences()

const defaultLanguage = 'en-US'
const searchQuery = ref('')
const selectedLanguage = ref(appStore.language)

const filteredLanguages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return query
    ? mockLanguages.filter((language) =>
        [language.code, language.label].some((value) => value.toLowerCase().includes(query)),
      )
    : mockLanguages
})

function saveLanguage() {
  appStore.setLanguage(selectedLanguage.value)
}

function resetLanguage() {
  selectedLanguage.value = defaultLanguage
  appStore.setLanguage(defaultLanguage)
}
</script>

<template>
  <section class="preference-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>APP LANGUAGE</h1>
    </header>

    <v-text-field
      v-model="searchQuery"
      class="preference-view__search"
      clearable
      hide-details
      placeholder="Search Languages..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <div class="preference-view__list">
      <button
        v-for="language in filteredLanguages"
        :key="language.code"
        class="preference-view__option"
        type="button"
        @click="selectedLanguage = language.code"
      >
        <span class="preference-view__flag">{{ language.flag }}</span>
        <strong>{{ language.label }}</strong>
        <v-icon v-if="selectedLanguage === language.code" icon="mdi-check" />
      </button>
    </div>

    <section class="preference-view__info">
      <h2>Language Information</h2>
      <ul>
        <li>This setting controls app text and notifications.</li>
        <li>System default is English (US).</li>
        <li>Some language packs may require a minor download later.</li>
      </ul>
    </section>

    <div class="preference-view__actions">
      <app-button block @click="saveLanguage">Save Language</app-button>
      <app-button block tone="ghost" variant="outlined" @click="resetLanguage">
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
  grid-template-columns: auto minmax(0, 1fr) auto;
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
  overflow: hidden;
  color: var(--color-muted);
  font-size: 1rem;
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
