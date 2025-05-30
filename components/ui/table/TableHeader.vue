<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <thead :class="$props.class">
    <slot />
  </thead>
</template>
