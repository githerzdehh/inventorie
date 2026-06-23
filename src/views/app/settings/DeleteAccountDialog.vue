<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppButton from '@/components/common/app-button.vue'
import { useAuthStore } from '@/stores/auth'

const isOpen = defineModel<boolean>({ default: false })

const authStore = useAuthStore()
const feedback = ref('')
const hasConfirmedIntent = ref(false)
const isSubmitting = ref(false)

const canSubmitDeletionRequest = computed(() => hasConfirmedIntent.value && !isSubmitting.value)

function closeDialog() {
  isOpen.value = false
}

async function submitDeletionRequest() {
  if (!canSubmitDeletionRequest.value) {
    return
  }

  isSubmitting.value = true

  try {
    const wasRequested = await authStore.requestAccountDeletion(feedback.value)

    if (wasRequested) {
      closeDialog()
    }
  } finally {
    isSubmitting.value = false
  }
}

watch(isOpen, (open) => {
  if (!open) {
    feedback.value = ''
    hasConfirmedIntent.value = false
    isSubmitting.value = false
  }
})
</script>

<template>
  <v-dialog v-model="isOpen" max-width="560" persistent scrim="rgba(16, 24, 40, 0.62)">
    <v-card class="delete-account-dialog" elevation="18">
      <v-card-text class="delete-account-dialog__body">
        <p class="delete-account-dialog__eyebrow">DELETE ACCOUNT INFO</p>

        <div class="delete-account-dialog__sections">
          <section class="delete-account-dialog__section">
            <h3>⚠️ Permanent Action</h3>
            <p>
              Deleting your account is permanent after the request is processed. Your profile,
              preferences, and access to INVENTORIÉ will be removed.
            </p>
          </section>

          <section class="delete-account-dialog__section">
            <h3>💳 Plan Cancellation</h3>
            <p>
              Any active plan or subscription will be queued for cancellation according to your
              current billing terms.
            </p>
          </section>

          <section class="delete-account-dialog__section">
            <h3>🔄 Data Deactivation</h3>
            <p>
              Your saved inventory, receipt scans, and account data will be deactivated while the
              deletion request is reviewed.
            </p>
          </section>

          <section class="delete-account-dialog__section">
            <h3>💬 Optional Feedback</h3>
            <p>Share anything that would help us improve before you leave.</p>
            <v-textarea
              v-model="feedback"
              auto-grow
              class="delete-account-dialog__feedback"
              hide-details
              placeholder="Why are you leaving? (Optional)..."
              rows="3"
              variant="outlined"
            />
          </section>
        </div>

        <v-checkbox
          v-model="hasConfirmedIntent"
          class="delete-account-dialog__confirmation"
          color="error"
          hide-details
          label="I confirm that I want to request permanent account deletion."
        />

        <div class="delete-account-dialog__actions">
          <app-button
            class="delete-account-dialog__button"
            tone="ghost"
            variant="outlined"
            @click="closeDialog"
          >
            Keep Account
          </app-button>
          <app-button
            class="delete-account-dialog__button"
            color="error"
            :disabled="!canSubmitDeletionRequest"
            :loading="isSubmitting"
            tone="danger"
            @click="submitDeletionRequest"
          >
            I Understand, Proceed
          </app-button>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.delete-account-dialog {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-danger) 26%, transparent);
  border-radius: 28px;
  background: var(--color-surface);
}

.delete-account-dialog__body {
  display: grid;
  gap: var(--space-5);
  padding: clamp(var(--space-5), 5vw, var(--space-8));
}

.delete-account-dialog__eyebrow {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.82rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-align: center;
}

.delete-account-dialog__sections {
  display: grid;
  gap: var(--space-4);
}

.delete-account-dialog__section {
  display: grid;
  gap: var(--space-2);
}

.delete-account-dialog__section h3,
.delete-account-dialog__section p {
  margin: 0;
}

.delete-account-dialog__section h3 {
  color: var(--color-text);
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
}

.delete-account-dialog__section p {
  color: var(--color-muted);
  line-height: 1.55;
}

.delete-account-dialog__feedback :deep(textarea) {
  line-height: 1.45;
}

.delete-account-dialog__confirmation {
  padding: var(--space-3);
  border: 1px solid color-mix(in srgb, var(--color-danger) 24%, transparent);
  border-radius: var(--radius-lg);
  background: var(--color-danger-soft);
}

.delete-account-dialog__confirmation :deep(.v-label) {
  color: var(--color-danger);
  font-weight: var(--font-weight-bold);
  opacity: 1;
}

.delete-account-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.delete-account-dialog__button {
  min-width: 0;
}

@media (max-width: 520px) {
  .delete-account-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
