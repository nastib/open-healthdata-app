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
        <ClientOnly>
          <ul class="space-y-1">
            <li v-for="link in filteredMenuLinks" :key="link.path">
              <template v-if="routeExists(link.path)">
                <NuxtLink
                  :to="link.path"
                  class="flex items-center rounded-md px-3 py-2 text-md font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  active-class="bg-accent text-accent-foreground"
                  :aria-current="isActive(link.path) ? 'page' : undefined"
                >
                  <Icon :name="link.icon" class="mr-3 h-4 w-4" />
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </template>
              <template v-else>
                <span class="flex items-center rounded-md px-3 py-2 text-md font-medium text-muted-foreground cursor-not-allowed">
                  <Icon :name="link.icon" class="mr-3 h-4 w-4" />
                  <span>{{ link.label }}</span>
                </span>
              </template>
            </li>
          </ul>
        </ClientOnly>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { resolve } = useRouter();
const { menuLinks } = storeToRefs(useCoreStore());
const { hasRole } = useRoles();

const filteredMenuLinks = computed(() => {
  return menuLinks.value.filter(link => link.roles.some(role => hasRole(role)));
});

const sidebarOpen = useState<boolean>('sidebarOpen', () => true);
const route = useRoute();

const isActive = (path: string): boolean => {
  return route.path.startsWith(path);
};

const routeExists = (path: string): boolean => {
  try {
    return !!resolve(path).name;
  } catch {
    return false;
  }
};
</script>
