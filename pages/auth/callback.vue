<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl text-center">Authenticating...</CardTitle>
      </CardHeader>
      <CardContent class="text-center">
        <p>Please wait while we verify your credentials</p>
        <Loader class="mx-auto my-4" />
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'auth',
  auth: false,
});

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  try {
    // Handle OAuth callback and session creation
    const supabase = useSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;
    if (!data.session) throw new Error('No session found');

    authStore.setSession(data.session);
    authStore.setUser(data.session.user);
    await authStore.syncUserProfile();

    toast.success('Logged in successfully');
    router.push('/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    toast.error('Failed to authenticate. Please try again.');
    router.push('/auth/login');
  }
});
</script>
