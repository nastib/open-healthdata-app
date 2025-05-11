<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-64 border-r bg-background transition-all duration-300 ease-in-out"
    :class="{ 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen }"
    aria-label="Main navigation"
  >
    <div class="flex h-full flex-col">
      <div class="flex h-16 items-center border-b px-6">
        <h2 class="text-lg font-semibold">Navigation</h2>
      </div>
      <nav class="flex-1 overflow-y-auto p-4">
        <ul class="space-y-1">
          <li v-for="link in filteredMenuLinks" :key="link.path">
            <NuxtLink
              :to="link.path"
              class="flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              active-class="bg-accent text-accent-foreground"
              :aria-current="isActive(link.path) ? 'page' : undefined"
            >
              <Icon :name="link.icon" class="mr-3 h-4 w-4" />
              <span>{{ link.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Role } from '@prisma/client';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

const sidebarOpen = useState<boolean>('sidebarOpen', () => true);
const route = useRoute();
const { hasRole } = useRoles();

const menuLinks: NavLink[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'lucide:layout-dashboard', roles: ['ADMIN', 'USER'] },
  { path: '/data-categories', label: 'Data Categories', icon: 'lucide:folder', roles: ['ADMIN'] },
  { path: '/organization-elements', label: 'Organization Elements', icon: 'lucide:building', roles: ['USER'] },
  { path: '/variables', label: 'Variables', icon: 'lucide:variable', roles: ['ADMIN', 'USER'] },
];

const filteredMenuLinks = computed(() => menuLinks.filter(item => item.roles.some(role => hasRole(role))));

const isActive = (path: string): boolean => {
  return route.path.startsWith(path);
};
</script>
