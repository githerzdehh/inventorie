<script setup lang="ts">
import AppButton from '@/components/common/app-button.vue'
import AppCard from '@/components/common/app-card.vue'

const sampleFriendGifts = [
  {
    id: 'welcome-basket',
    title: 'Welcome basket from Maya',
    description: 'A starter bundle with pantry staples ready to review.',
  },
  {
    id: 'weekend-snacks',
    title: 'Weekend snacks from Jordan',
    description: 'Shared treats and ingredients for your next gathering.',
  },
]
</script>

<template>
  <section class="notifications-view app-page app-stack">
    <div class="app-page-heading">
      <h2>Notifications</h2>
      <p>Review updates, shared inventory activity, and friend gift invitations.</p>
    </div>

    <v-row>
      <v-col v-for="gift in sampleFriendGifts" :key="gift.id" cols="12" md="6">
        <app-card :title="gift.title" :subtitle="gift.description" icon="mdi-gift-outline">
          <template #actions>
            <app-button
              :to="`/app/notifications/friend-gift/${gift.id}`"
              variant="tonal"
              icon="mdi-open-in-new"
            >
              View gift
            </app-button>
          </template>
        </app-card>
      </v-col>
    </v-row>
  </section>
</template>
