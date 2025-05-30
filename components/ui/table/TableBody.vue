<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <tbody :class="$props.class" class="[&_tr:last-child]:border-0">
    <slot />
  </tbody>
</template>
