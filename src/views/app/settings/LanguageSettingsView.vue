<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { useAppStore } from '@/stores/app'

interface LanguageOption {
  code: string
  name: string
  nativeName: string
  region: string
  flag: string
}

const appStore = useAppStore()
appStore.initializePreferences()

const defaultLanguage = 'en-US'
const searchQuery = ref('')
const selectedLanguage = ref(appStore.language)

const languages: LanguageOption[] = [
  { code: 'en-US', name: 'English', nativeName: 'English', region: 'United States', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', region: 'Spain', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', region: 'France', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', region: 'Germany', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', region: 'Italy', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', region: 'Brazil', flag: '🇧🇷' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', region: 'Japan', flag: '🇯🇵' },
]

const filteredLanguages = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return languages
  }

  return languages.filter((language) =>
    [language.code, language.name, language.nativeName, language.region].some((value) =>
      value.toLowerCase().includes(query),
    ),
  )
})

const activeLanguage = computed(
  () => languages.find((language) => language.code === selectedLanguage.value) ?? languages[0],
)

function saveLanguage() {
  appStore.setLanguage(selectedLanguage.value)
}

function resetLanguage() {
  selectedLanguage.value = defaultLanguage
  appStore.setLanguage(defaultLanguage)
}
</script>

<template>
  <section class="preference-view app-page app-stack">
    <div class="app-page-heading preference-view__heading">
      <app-button icon="mdi-arrow-left" size="small" tone="ghost" to="/app/settings" variant="tonal">
        Settings
      </app-button>
      <div>
        <p class="preference-view__eyebrow">App Language</p>
        <h2>Choose your app language</h2>
        <p>Set the language used for labels, menus, and inventory guidance across INVENTORIÉ.</p>
      </div>
    </div>

    <v-text-field
      v-model="searchQuery"
      class="preference-view__search"
      clearable
      hide-details
      placeholder="Search Languages..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
    />

    <v-card class="preference-view__list" border elevation="0">
      <v-list bg-color="transparent" lines="two">
        <v-list-item
          v-for="language in filteredLanguages"
          :key="language.code"
          :active="selectedLanguage === language.code"
          class="preference-view__option"
          rounded="lg"
          @click="selectedLanguage = language.code"
        >
          <template #prepend>
            <span class="preference-view__flag" aria-hidden="true">{{ language.flag }}</span>
          </template>
          <v-list-item-title>{{ language.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ language.nativeName }} · {{ language.region }}</v-list-item-subtitle>
          <template #append>
            <v-icon v-if="selectedLanguage === language.code" color="primary" icon="mdi-check-circle" />
          </template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card class="preference-view__info" border elevation="0">
      <v-card-text>
        <p class="preference-view__eyebrow">Language information</p>
        <h3>{{ activeLanguage.name }} ({{ activeLanguage.code }})</h3>
        <p>
          INVENTORIÉ will use {{ activeLanguage.nativeName }} for supported app text. Receipt item
          names and imported store details remain in the language printed on the receipt.
        </p>
      </v-card-text>
    </v-card>

    <div class="preference-view__actions">
      <app-button block icon="mdi-content-save-outline" @click="saveLanguage">Save Language</app-button>
      <app-button block icon="mdi-refresh" tone="ghost" variant="tonal" @click="resetLanguage">
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
