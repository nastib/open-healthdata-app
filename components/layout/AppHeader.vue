<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <Button variant="ghost" size="icon" class="mr-2" @click="toggleSidebar" aria-label="Toggle sidebar">
        <Icon name="lucide:menu" size="20" />
      </Button>

      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2" aria-label="Home">
          <span class="hidden font-bold sm:inline-block">OpenHealthData</span>
        </NuxtLink>
      </div>

      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <Command>
            <CommandInput placeholder="Search..." aria-label="Search" />
          </Command>
        </div>
        <nav class="flex items-center space-x-2">
          <ThemeToggle />
          <UserDropdown />
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import UserDropdown from '@/components/layout/UserDropdown.vue';
import { Button } from '@/components/ui/button';
import { Command, CommandInput } from '@/components/ui/command';

const sidebarOpen = useState<boolean>('sidebarOpen', () => true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>
