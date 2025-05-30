<script setup lang="ts">
defineProps<{
  class?: string;
  colspan?: number;
}>();
</script>

<template>
  <td :class="$props.class" :colspan="$props.colspan" class="p-4 align-middle [&:has([role=checkbox])]:pr-0">
    <slot />
  </td>
</template>
