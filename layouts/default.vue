<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <div class="flex justify-around">
      <AppSidebar />
      <main
        class="flex-1 overflow-auto transition-[margin-left] duration-300 ease-in-out"
        :class="{ 'md:ml-38': sidebarOpen, 'ml-0': !sidebarOpen }"
      >
        <div class="container py-6 px-4 md:px-6">
          <slot />
        </div>
        <AppFooter />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';

const sidebarOpen = useState('sidebarOpen', () => true);
</script>
