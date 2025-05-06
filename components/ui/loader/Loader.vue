<template>
  <span
    v-if="loading"
    class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
    :class="[sizeClasses, marginClass, customClass]"
    role="status"
    :aria-label="ariaLabel || 'Loading'"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    margin?: boolean;
    ariaLabel?: string;
    class?: string;
  }>(),
  {
    loading: true,
    size: 'sm',
    margin: true,
  },
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-3 w-3';
    case 'sm':
      return 'h-4 w-4';
    case 'md':
      return 'h-5 w-5';
    case 'lg':
      return 'h-6 w-6';
    case 'xl':
      return 'h-8 w-8';
    default:
      return 'h-4 w-4';
  }
});

const marginClass = computed(() => (props.margin ? 'mr-2' : ''));
const customClass = computed(() => props.class || '');
</script>
