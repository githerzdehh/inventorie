<script setup lang="ts">
import { computed } from 'vue'

interface SelectMenuFieldItem {
  title: string
  value: string
}

const props = defineProps<{
  modelValue: string
  items: SelectMenuFieldItem[]
  label: string
  disabled?: boolean
  errorMessage?: string | null
  hint?: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedItem = computed(
  () => props.items.find((item) => item.value === props.modelValue) ?? null,
)
const selectedLabel = computed(() => selectedItem.value?.title ?? 'Select')
</script>

<template>
  <div class="select-menu-field">
    <span class="select-menu-field__label">{{ label }}</span>

    <v-menu :disabled="disabled" location="bottom start">
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          :disabled="disabled"
          append-icon="mdi-chevron-down"
          class="select-menu-field__button"
          variant="outlined"
        >
          <span>{{ selectedLabel }}</span>
        </v-btn>
      </template>

      <v-list class="select-menu-field__list" density="compact" role="listbox">
        <v-list-item
          v-for="item in items"
          :key="item.value"
          :active="item.value === modelValue"
          :title="item.title"
          :value="item.value"
          role="option"
          @click="emit('update:modelValue', item.value)"
        >
          <template #prepend>
            <v-icon
              :icon="item.value === modelValue ? 'mdi-check-circle-outline' : 'mdi-circle-outline'"
              size="small"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-menu>

    <span
      v-if="errorMessage || hint"
      class="select-menu-field__message"
      :class="{ 'select-menu-field__message--error': errorMessage }"
    >
      {{ errorMessage || hint }}
    </span>
  </div>
</template>

<style scoped>
.select-menu-field {
  display: grid;
  gap: var(--space-1);
}

.select-menu-field__label {
  color: var(--color-muted);
  font-size: 0.76rem;
  font-weight: var(--font-weight-medium);
}

.select-menu-field__button {
  justify-content: space-between;
  min-height: 56px;
  color: var(--color-text) !important;
  background: var(--color-surface) !important;
  border-color: var(--color-border) !important;
  border-radius: var(--radius-md);
}

.select-menu-field__button span {
  min-width: 0;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-menu-field__list {
  min-width: min(18rem, calc(100vw - 2rem));
}

.select-menu-field__message {
  min-height: 1.25rem;
  color: var(--color-muted);
  font-size: 0.76rem;
}

.select-menu-field__message--error {
  color: var(--color-danger);
}
</style>
