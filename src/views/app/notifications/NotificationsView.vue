<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import { type NotificationType, useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

const notificationIcons: Record<NotificationType, string> = {
  pantry: 'mdi-alert-circle',
  recipe: 'mdi-food-variant',
  comparison: 'mdi-handshake-outline',
  system: 'mdi-cog',
}

function relativeTime(createdAt: string): string {
  const created = new Date(createdAt).getTime()
  const today = new Date('2026-06-23T08:00:00.000Z').getTime()
  const hours = Math.max(0, Math.round((today - created) / 3_600_000))

  if (hours < 1) {
    return 'Just now'
  }

  if (hours < 24) {
    return `${hours} hours ago`
  }

  const days = Math.round(hours / 24)

  return days === 1 ? 'Yesterday' : `${days} days ago`
}
</script>

<template>
  <section class="notifications-view app-page app-mobile-shell">
    <header class="mock-brand-header">
      <h1>INVENTORIÉ</h1>
      <h2>NOTIFICATIONS</h2>
    </header>

    <div class="notifications-view__actions">
      <v-chip color="primary" variant="tonal">{{ notificationsStore.unreadCount }} unread</v-chip>
      <app-button
        v-if="notificationsStore.unreadCount"
        icon="mdi-check-all"
        size="small"
        variant="tonal"
        @click="notificationsStore.markAllAsRead"
      >
        Mark read
      </app-button>
    </div>

    <div class="notifications-view__list">
      <article
        v-for="notification in notificationsStore.allNotifications"
        :key="notification.id"
        class="notifications-view__card"
        :class="{ 'notifications-view__card--unread': !notification.read }"
        @click="notificationsStore.markAsRead(notification.id)"
      >
        <v-icon class="notifications-view__icon" :icon="notificationIcons[notification.type]" />
        <div>
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.description }}</p>
          <small>{{ relativeTime(notification.createdAt) }}</small>
        </div>
      </article>
    </div>

    <app-button icon="mdi-arrow-left" tone="ghost" to="/app/settings" variant="tonal">
      Back to settings
    </app-button>
  </section>
</template>

<style scoped>
.notifications-view {
  display: grid;
  gap: var(--space-4);
  padding-bottom: var(--space-10);
}

.notifications-view__actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding-inline: var(--space-4);
}

.notifications-view__list {
  display: grid;
  gap: var(--space-3);
}

.notifications-view__card {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: var(--space-3);
  align-items: center;
  min-height: 7rem;
  padding: var(--space-4);
  color: var(--color-text);
  background: var(--color-surface);
  border: 0;
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.notifications-view__card--unread {
  box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.notifications-view__icon {
  color: #2e9230;
  font-size: 4.2rem;
}

.notifications-view__card:first-child .notifications-view__icon {
  color: #ff2a34;
}

.notifications-view h3,
.notifications-view p {
  margin: 0;
}

.notifications-view h3 {
  font-size: 1.2rem;
  line-height: 1.15;
}

.notifications-view p {
  font-size: 1.05rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.notifications-view small {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text);
  font-style: italic;
  text-align: right;
}
</style>
