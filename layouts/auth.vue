<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="flex-1 overflow-auto transition-[margin-left] duration-300 ease-in-out">
      <div class="container py-6 px-4 md:px-6">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
</script>
