<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/common/app-button.vue'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const notificationsStore = useNotificationsStore()

const giftId = computed(() => String(route.params.id ?? ''))
const gift = computed(() => notificationsStore.notificationById(giftId.value))
const giftItems = computed(() => gift.value?.giftItems ?? [])
const hasDecision = computed(() => gift.value?.giftStatus && gift.value.giftStatus !== 'pending')

async function acceptGift() {
  await notificationsStore.acceptFriendGift(giftId.value)
}

function declineGift() {
  notificationsStore.declineFriendGift(giftId.value)
}
</script>

<template>
  <section class="friend-gift-view app-page app-stack">
    <app-button icon="mdi-arrow-left" tone="ghost" variant="tonal" @click="router.back()">
      Back to notifications
    </app-button>

    <v-alert v-if="!gift" type="warning" variant="tonal">
      This gift notification could not be found.
    </v-alert>

    <template v-else>
      <v-card class="friend-gift-view__hero" border elevation="0">
        <v-card-text>
          <v-avatar class="friend-gift-view__avatar" size="72">
            {{ gift.senderAvatar ?? 'FG' }}
          </v-avatar>
          <p class="friend-gift-view__eyebrow">Friend gift</p>
          <h2>{{ gift.senderName }} sent groceries</h2>
          <p>{{ gift.message }}</p>
          <v-chip class="friend-gift-view__status" size="small">
            {{ gift.giftStatus }}
          </v-chip>
        </v-card-text>
      </v-card>

      <v-alert v-if="notificationsStore.successMessage" color="success" variant="tonal">
        {{ notificationsStore.successMessage }}
      </v-alert>
      <v-alert v-if="notificationsStore.errorMessage" color="error" variant="tonal">
        {{ notificationsStore.errorMessage }}
      </v-alert>

      <v-card class="friend-gift-view__items" border elevation="0">
        <v-card-title>Gift details</v-card-title>
        <v-card-subtitle>{{ giftItems.length }} items ready to add to your pantry</v-card-subtitle>
        <v-list bg-color="transparent">
          <v-list-item v-for="item in giftItems" :key="item.id">
            <template #prepend>
              <v-avatar class="friend-gift-view__item-icon" size="40">
                <v-icon icon="mdi-food-apple-outline" />
              </v-avatar>
            </template>
            <v-list-item-title>{{ item.displayName }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ item.quantity }} {{ item.unit }} · {{ item.note }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>

      <div class="friend-gift-view__actions">
        <app-button
          :disabled="Boolean(hasDecision)"
          :loading="notificationsStore.isProcessingGift"
          block
          icon="mdi-check-circle-outline"
          @click="acceptGift"
        >
          Accept gift
        </app-button>
        <app-button
          :disabled="Boolean(hasDecision) || notificationsStore.isProcessingGift"
          block
          icon="mdi-close-circle-outline"
          tone="danger"
          variant="tonal"
          @click="declineGift"
        >
          Decline
        </app-button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.friend-gift-view__hero,
.friend-gift-view__items {
  background: var(--color-surface);
}

.friend-gift-view__hero :deep(.v-card-text) {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-5);
  text-align: center;
}

.friend-gift-view__avatar,
.friend-gift-view__item-icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
  font-weight: var(--font-weight-bold);
}

.friend-gift-view__eyebrow {
  margin: 0;
  color: var(--color-accent-dark);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.friend-gift-view__hero h2,
.friend-gift-view__hero p {
  margin: 0;
}

.friend-gift-view__hero p {
  color: var(--color-muted);
}

.friend-gift-view__status {
  color: var(--color-primary-dark);
  background: var(--color-primary-soft);
  text-transform: capitalize;
}

.friend-gift-view__actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .friend-gift-view__actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
