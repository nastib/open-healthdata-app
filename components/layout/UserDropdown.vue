<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        class="relative h-8 w-8 rounded-full transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        @click="toggleDropdown()"
        ref="triggerRef"
      >
        <Avatar class="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-56"
      align="end"
      :forceMount="true"
      :class="{
        'animate-in fade-in-80 zoom-in-95': isOpen,
        'animate-out fade-out-0 zoom-out-95': !isOpen,
      }"
      v-if="isOpen"
    >
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">User Name</p>
          <p class="text-xs leading-none text-muted-foreground">user@example.com</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <NuxtLink to="/profile" class="w-full">Profile</NuxtLink>
      </DropdownMenuItem>
      <DropdownMenuItem>Settings</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout()"> Log out </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { onClickOutside } from '@vueuse/core';

/**
 * User dropdown component with toggle functionality
 * @component
 * @example
 * <UserDropdown />
 */
const isLoading = ref(false);
const isOpen = ref<boolean>(false);
const triggerRef = ref<HTMLElement | null>(null);
const router = useRouter();
const { auth } = useSupabase();
const authStore = useAuthStore();
type AuthError = { message: string };

/**
 * Toggles the dropdown menu state
 */
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

/**
 * Closes the dropdown menu
 */
const closeDropdown = () => {
  isOpen.value = false;
};

// Close dropdown when clicking outside
watchEffect(() => {
  if (isOpen.value) {
    onClickOutside(triggerRef, closeDropdown);
  }
});

/**
 * Handles user logout
 * @async
 * @throws {AuthError} When logout fails
 */
const handleLogout = async () => {
  try {
    isLoading.value = true;

    // Sign out from Supabase
    //const { error } = await auth.signOut();

    //if (error) throw error;

    // Clear local auth state
    await authStore.logout();

    // Show success feedback
    //console.log('Logged out successfully');

    // Redirect to login page
    await navigateTo('/auth/login');
  } catch (error) {
    console.error('Logout failed:', (error as AuthError).message);
  } finally {
    isLoading.value = false;
  }
};
</script>
