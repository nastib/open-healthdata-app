<template>
  <div class="max-w-md mx-auto mt-10 p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Reset Password</CardTitle>
        <CardDescription> Enter your email to receive a password reset link </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" v-model="form.email" required />
            </div>
            <Button type="submit" class="w-full" :disabled="loading">
              <Loader :loading="loading" size="sm" aria-label="Sending reset link" />
              <span>Send Reset Link</span>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="text-sm text-center">
        Remember your password? <NuxtLink to="/auth/login" class="underline">Login</NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/ui/loader';

definePageMeta({
  layout: 'auth',
});

const supabase = useSupabase();
const loading = ref(false);
const form = reactive({
  email: '',
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    });

    if (error) throw error;
    toast.success('Password reset link sent to your email');
  } catch (error: any) {
    toast.error(error?.message || 'Failed to send reset link');
  } finally {
    loading.value = false;
  }
};
</script>
