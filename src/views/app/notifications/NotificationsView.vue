<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import EmptyState from '@/components/common/empty-state.vue'
import { formatDisplayDateTime } from '@/composables/date-utils'
import { type NotificationType, useNotificationsStore } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

const notificationTypeLabels: Record<NotificationType, string> = {
  pantry: 'Pantry',
  recipe: 'Recipe',
  system: 'System',
}
</script>

<template>
  <section class="notifications-view app-page app-stack">
    <div class="notifications-view__header">
      <div class="app-page-heading">
        <h2>Activity</h2>
        <p>Review updates, shared inventory activity, and app alerts.</p>
      </div>

      <div class="notifications-view__actions">
        <v-chip aria-label="Unread notifications" color="primary" variant="tonal">
          {{ notificationsStore.unreadCount }} unread
        </v-chip>
        <app-button
          v-if="notificationsStore.unreadCount > 0"
          icon="mdi-check-all"
          variant="tonal"
          @click="notificationsStore.markAllAsRead"
        >
          Mark all as read
        </app-button>
      </div>
    </div>

    <empty-state
      v-if="notificationsStore.allNotifications.length === 0"
      icon="mdi-bell-outline"
      title="No notifications yet"
      description="Updates about pantry activity, recipes, and app alerts will appear here."
    />

    <div v-else class="notifications-view__list">
      <v-card
        v-for="notification in notificationsStore.allNotifications"
        :key="notification.id"
        class="notifications-view__card"
        :class="{ 'notifications-view__card--unread': !notification.read }"
        border
        elevation="0"
      >
        <v-card-item>
          <template #prepend>
            <v-avatar class="notifications-view__icon" size="44">
              <v-icon icon="mdi-bell-outline" />
            </v-avatar>
          </template>

          <v-card-title>{{ notification.title }}</v-card-title>
          <v-card-subtitle>{{ formatDisplayDateTime(notification.createdAt) }}</v-card-subtitle>

          <template #append>
            <div class="notifications-view__chips">
              <v-chip v-if="!notification.read" color="primary" size="small" variant="tonal">
                Unread
              </v-chip>
              <v-chip size="small" variant="tonal">
                {{ notificationTypeLabels[notification.type] }}
              </v-chip>
            </div>
          </template>
        </v-card-item>

        <v-card-text>
          <p>{{ notification.description }}</p>
        </v-card-text>
      </v-card>
    </div>
  </section>
</template>

<style scoped>
.notifications-view__header,
.notifications-view__actions,
.notifications-view__chips {
  display: flex;
  gap: var(--space-3);
}

.notifications-view__header {
  align-items: flex-start;
  justify-content: space-between;
}

.notifications-view__actions,
.notifications-view__chips {
  align-items: center;
  flex-wrap: wrap;
}

.notifications-view__list {
  display: grid;
  gap: var(--space-4);
}

.notifications-view__card {
  border-color: var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.notifications-view__card--unread {
  border-color: color-mix(in srgb, var(--color-primary) 36%, var(--color-border));
  background: linear-gradient(90deg, var(--color-primary-soft), var(--color-surface) 34%);
}

.notifications-view__icon {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

@media (max-width: 640px) {
  .notifications-view__header {
    display: grid;
  }
}
</style>
