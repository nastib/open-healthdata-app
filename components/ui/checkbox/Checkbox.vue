<template>
  <div class="flex items-center space-x-2">
    <button
      type="button"
      role="checkbox"
      :aria-checked="modelValue"
      :data-state="modelValue ? 'checked' : 'unchecked'"
      :class="[
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        modelValue ? 'bg-primary text-primary-foreground' : '',
        $attrs.class,
      ]"
      @click="toggle"
    >
      <svg
        v-if="modelValue"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-4 w-4"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>
    <label v-if="label" :for="id" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {{ label }}
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    label?: string;
    id?: string;
  }>(),
  {
    modelValue: false,
    id: 'checkbox',
  },
);

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>
