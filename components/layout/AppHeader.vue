<template>
  <header
    class="sticky top-0 pr-2 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    aria-label="Main navigation"
  >
    <div class="container mx-auto flex h-14 items-center">
      <Button variant="ghost" size="icon" class="mr-2" @click="toggleSidebar" aria-label="Toggle sidebar">
        <Icon name="lucide:menu" size="20" />
      </Button>

      <div class="mr-4 hidden md:flex items-center">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2" aria-label="Home">
          <span class="hidden font-bold sm:inline-block">OpenHealthData</span>
        </NuxtLink>

        <nav aria-label="Breadcrumb" class="flex items-center">
          <ol class="flex items-center space-x-1 text-sm">
            <li v-for="(item, index) in breadcrumbs" :key="index">
              <NuxtLink :to="item.to" class="hover:text-primary" :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
                {{ item.text }}
              </NuxtLink>
              <span v-if="index < breadcrumbs.length - 1" class="ml-1 text-sm">➤</span>
            </li>
          </ol>
        </nav>
      </div>

      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <Command>
            <CommandInput placeholder="Search..." aria-label="Search" />
          </Command>
        </div>

        <div class="flex items-center space-x-4">
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import UserDropdown from '@/components/layout/UserDropdown.vue';
import { Button } from '@/components/ui/button';
import { Command, CommandInput } from '@/components/ui/command';

const route = useRoute();
const { hasRole } = useRoles();

const navItems = [
  { to: '/dashboard', text: 'Dashboard', label: 'Go to Dashboard', roles: ['ADMIN', 'USER'] },
  { to: '/admin', text: 'Admin', label: 'Admin Panel', roles: ['ADMIN'] },
  { to: '/profile', text: 'Profile', label: 'User Profile', roles: ['ADMIN', 'USER'] },
];

const filteredNavItems = computed(() => navItems.filter(item => item.roles.some(role => hasRole(role))));

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean);

  return paths.map((path, index) => ({
    to: '/' + paths.slice(0, index + 1).join('/'),
    text: path.charAt(0).toUpperCase() + path.slice(1),
  }));
});

const sidebarOpen = useState<boolean>('sidebarOpen', () => true);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>
