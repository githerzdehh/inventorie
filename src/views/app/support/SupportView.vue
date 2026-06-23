<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { mockSupportTopics } from '@/mocks/data/mock-app'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const appStore = useAppStore()
const authStore = useAuthStore()
appStore.initializePreferences()

const showSentMessage = ref(false)
const form = reactive({
  topic: mockSupportTopics[0]?.value ?? 'bug',
  email: authStore.currentUser?.email ?? '',
  phoneNumber: authStore.currentUser?.phoneNumber ?? '',
  message: '',
})

const topicItems = computed(() =>
  mockSupportTopics.map((topic) => ({
    title: topic.title,
    value: topic.value,
  })),
)
const canSubmit = computed(
  () => Boolean(form.topic && form.email.trim() && form.message.trim().length >= 8),
)

function submitSupportMessage() {
  if (!canSubmit.value) {
    return
  }

  appStore.addSupportSubmission({
    topic: form.topic,
    email: form.email.trim(),
    phoneNumber: form.phoneNumber.trim(),
    message: form.message.trim(),
  })
  form.message = ''
  showSentMessage.value = true
}

watch(
  () => authStore.currentUser,
  (user) => {
    form.email = user?.email ?? ''
    form.phoneNumber = user?.phoneNumber ?? ''
  },
  { immediate: true },
)
</script>

<template>
  <section class="support-view app-page app-mobile-shell">
    <header class="mock-hero">
      <h1>SUPPORT</h1>
    </header>

    <v-card class="support-view__card" border elevation="0">
      <v-card-text class="support-view__form">
        <v-select
          v-model="form.topic"
          :items="topicItems"
          hide-details
          label="What do you need?"
          variant="outlined"
        />

        <v-text-field v-model="form.email" hide-details label="Email" type="email" variant="outlined" />

        <v-text-field
          v-model="form.phoneNumber"
          hide-details
          label="Phone"
          type="tel"
          variant="outlined"
        />

        <v-textarea
          v-model="form.message"
          auto-grow
          label="Message"
          placeholder="Tell the team what happened or what you need..."
          rows="6"
          variant="outlined"
        />

        <app-button
          :disabled="!canSubmit"
          block
          icon="mdi-send-outline"
          size="large"
          @click="submitSupportMessage"
        >
          Submit
        </app-button>
      </v-card-text>
    </v-card>

    <v-alert v-if="showSentMessage" class="support-view__success" icon="mdi-check-circle-outline" variant="tonal">
      Your message has been sent to the team.
    </v-alert>

    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/settings" variant="tonal">
      Back to settings
    </app-button>
  </section>
</template>

<style scoped>
.support-view {
  display: grid;
  gap: var(--space-5);
}

.support-view__card {
  background: var(--color-surface);
  border-color: var(--color-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.support-view__form {
  display: grid;
  gap: var(--space-4);
}

.support-view__success {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-secondary-soft) 76%, white);
  border: 1px solid var(--color-primary);
}
</style>
