<script setup lang="ts">
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div class="relative w-full overflow-auto">
    <table :class="$props.class" class="w-full caption-bottom text-sm">
      <slot />
    </table>
  </div>
</template>
