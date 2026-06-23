<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore, type AppNotification } from '@/stores/notifications'

const router = useRouter()
const notificationsStore = useNotificationsStore()

const notificationIcon = computed<Record<AppNotification['kind'], string>>(() => ({
  friend_gift: 'mdi-gift-outline',
  restock: 'mdi-cart-arrow-down',
  freshness: 'mdi-clock-alert-outline',
}))

function formatNotificationTime(value: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

async function openNotification(notification: AppNotification) {
  notificationsStore.markRead(notification.id)

  if (notification.kind === 'friend_gift') {
    await router.push(`/app/notifications/friend-gift/${notification.id}`)
  }
}
</script>

<template>
  <section class="notifications-view app-page app-stack">
    <div class="notifications-view__hero">
      <div class="app-page-heading">
        <p class="notifications-view__eyebrow">Activity center</p>
        <h2>Notifications</h2>
        <p>Stay on top of gifts, pantry reminders, and freshness updates.</p>
      </div>
      <v-avatar class="notifications-view__bell" size="64">
        <v-icon icon="mdi-bell-badge-outline" size="34" />
      </v-avatar>
    </div>

    <v-card class="notifications-view__summary" border elevation="0">
      <v-card-text>
        <span>{{ notificationsStore.unreadCount }}</span>
        <p>Unread notifications</p>
      </v-card-text>
    </v-card>

    <div class="notifications-view__list">
      <v-card
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        :class="{ 'notifications-view__item--unread': notification.unread }"
        class="notifications-view__item"
        border
        elevation="0"
        role="button"
        tabindex="0"
        @click="openNotification(notification)"
        @keydown.enter="openNotification(notification)"
      >
        <v-card-text class="notifications-view__item-content">
          <v-avatar class="notifications-view__item-icon" size="48">
            <v-icon :icon="notificationIcon[notification.kind]" />
          </v-avatar>
          <div class="notifications-view__copy">
            <div class="notifications-view__title-row">
              <h3>{{ notification.title }}</h3>
              <v-badge v-if="notification.unread" color="primary" dot inline />
            </div>
            <p>{{ notification.message }}</p>
            <span>{{ formatNotificationTime(notification.receivedAt) }}</span>
          </div>
          <v-icon icon="mdi-chevron-right" />
        </v-card-text>
      </v-card>
    </div>
  </section>
</template>

<style scoped>
.notifications-view__hero,
.notifications-view__summary,
.notifications-view__item {
  background: var(--color-surface);
}

.notifications-view__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-soft);
}

.notifications-view__eyebrow {
  margin: 0;
  color: var(--color-accent-dark);
  font-size: 0.82rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notifications-view__bell,
.notifications-view__item-icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.notifications-view__summary span {
  color: var(--color-primary);
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
}

.notifications-view__summary p,
.notifications-view__copy p,
.notifications-view__copy span {
  margin: 0;
  color: var(--color-muted);
}

.notifications-view__list {
  display: grid;
  gap: var(--space-3);
}

.notifications-view__item {
  cursor: pointer;
}

.notifications-view__item--unread {
  border-color: var(--color-primary);
  background: var(--color-secondary-soft);
}

.notifications-view__item-content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: var(--space-3);
  align-items: center;
}

.notifications-view__title-row {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.notifications-view__title-row h3 {
  margin: 0;
  font-size: 1rem;
}
</style>
