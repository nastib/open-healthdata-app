<template>
  <div class="max-w-md mx-auto mt-10 p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Set New Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="password">New Password</Label>
              <Input id="password" type="password" v-model="password" placeholder="••••••••••••••••••••••" required />
            </div>
            <div class="grid gap-2">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" v-model="confirmPassword" placeholder="••••••••••••••••••••••" required />
              <p v-if="error" class="text-sm text-red-500">
                {{ error }}
              </p>
            </div>
            <Button type="submit" class="w-full" :disabled="loading || !password || password !== confirmPassword">
              <Loader :loading="loading" size="sm" />
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';
const route = useRoute();
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const authStore = useAuthStore();

onMounted(() => {
  // Verify the token from URL
  if (!route.query.token) {
    error.value = 'Invalid reset link';
  }
});

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    await authStore.updatePassword(password.value);
    await navigateTo('/auth/login');
    toast.success('Password updated successfully');
  } catch (err) {
    toast.error('Failed to update password. Please try again.');
    error.value = 'Failed to update password. Please try again.';
    console.error('Password reset error:', err);
  } finally {
    loading.value = false;
  }
};
</script>
