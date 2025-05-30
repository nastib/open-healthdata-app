<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <tr :class="$props.class" class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <slot />
  </tr>
</template>
