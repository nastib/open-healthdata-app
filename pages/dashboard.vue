<template>
  <div class="min-h-svh p-6">
    <div class="grid gap-6">
      <!-- Welcome Section -->
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Open Health Data App</CardTitle>
          <CardDescription>Manage your health data securely</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Window width: {{ width }}px</p>
        </CardContent>
      </Card>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card v-for="i in 4" :key="i">
          <CardHeader>
            <CardTitle class="text-lg">Stat Card {{ i }}</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">Placeholder</div>
            <p class="text-sm text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Recent Activity -->
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="i in 3" :key="i" class="border-b pb-4 last:border-0">
                <p>Activity item {{ i }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Button variant="outline" class="w-full">Action 1</Button>
            <Button variant="outline" class="w-full">Action 2</Button>
            <Button variant="outline" class="w-full">Action 3</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';

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
