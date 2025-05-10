<template>
  <div class="max-w-md min-h-svh mx-auto mt-10 p-6">
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <h1>Welcome to Open Health Data App</h1>
        <p>This is the landing page</p>
        <p>Window width: {{ width }}px</p>
      </CardContent>
      <CardFooter>
        <Button>Click Me</Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card';
const roles = ['ADMIN', 'USER'];

definePageMeta({
  layout: 'default',
  title: 'Dashboard',
  auth: true,
  roles: roles,
});

onMounted(async () => {
  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  console.log('Dashboard mounted - auth state:', {
    isAuthenticated: authStore.isAuthenticated(),
    user: authStore.user,
    session: authStore.session,
  });

  console.log('Profile state:', {
    profile: profileStore.profile,
    loading: profileStore.loading,
  });

  if (authStore.user?.id && !profileStore.profile) {
    console.log('Fetching profile...');
    await profileStore.fetchProfile(authStore.user.id);
  }
});
const { width } = useWindowSize();
</script>
