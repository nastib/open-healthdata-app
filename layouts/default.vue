<template>
  <div class="max-h-screen flex flex-col">
    <AppHeader />
    <div class="flex justify-around">
      <AppSidebar />
      <main
        class="flex flex-col transition-[margin-left] duration-300 ease-in-out w-full"
        :class="{ 'md:ml-38': sidebarOpen, 'ml-0': !sidebarOpen }"
      >
        <div class="container w-full py-2 px-4 md:px-6" :class="{ 'md:ml-24 md:pr-28': sidebarOpen, 'ml-0 md:mx-auto ': !sidebarOpen }">
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
