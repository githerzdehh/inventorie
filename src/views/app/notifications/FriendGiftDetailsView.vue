<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationsStore } from '@/stores/notifications'
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'

const route = useRoute()
const notificationsStore = useNotificationsStore()

function normalizeRouteParam(param: unknown): string {
  if (Array.isArray(param)) {
    return typeof param[0] === 'string' ? param[0] : ''
  }

  return typeof param === 'string' ? param : ''
}

const giftId = computed(() => normalizeRouteParam(route.params.id))

onMounted(() => {
  if (giftId.value) {
    notificationsStore.markAsRead(giftId.value)
  }
})
</script>

<template>
  <section class="friend-gift-details-view app-page app-stack">
    <app-button to="/app/notifications" tone="ghost" variant="tonal" icon="mdi-arrow-left">
      Back to notifications
    </app-button>

    <app-card
      title="Friend gift details"
      :subtitle="giftId ? `Gift invitation ${giftId}` : 'Gift invitation unavailable'"
      icon="mdi-gift-outline"
    >
      <p v-if="giftId">
        Review the shared gift invitation and decide whether to add these items to your inventory.
      </p>
      <p v-else>
        This gift invitation link is missing a valid identifier. Return to notifications and try
        again.
      </p>
    </app-card>
  </section>
</template>
