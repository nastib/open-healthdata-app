<template>
  <div class="max-w-md mx-auto mt-10 p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" v-model="form.email" @blur="validateField('email')" placeholder="email@example.com" />
              <p v-if="errors.email" class="text-sm text-red-500">
                {{ errors.email }}
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="password">Password</Label>
              <Input
                id="password"
                type="password"
                v-model="form.password"
                @blur="validateField('password')"
                placeholder="••••••••••••••••••••"
              />
              <p v-if="errors.password" class="text-sm text-red-500">
                {{ errors.password }}
              </p>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <Checkbox id="remember" v-model="form.rememberMe" label="Remember me" />
              </div>
              <NuxtLink to="/auth/forgot-password" class="text-sm underline"> Forgot password? </NuxtLink>
            </div>
            <Button type="submit" class="w-full" :disabled="authStore.loading || !form.email || !form.password">
              <Loader :loading="authStore.loading" size="sm" aria-label="Logging in" />
              <span>Login</span>
            </Button>
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              class="w-full"
              @click="authStore.loginWithGoogle(form.rememberMe)"
              :disabled="authStore.loading"
            >
              <Icon name="logos:google-icon" class="h-4 w-4 mr-2" />
              Google
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="text-sm text-center">
        Don't have an account? <NuxtLink to="/auth/signup" class="underline">Sign Up</NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from '@/components/ui/loader';
import { useAuthStore } from '@/stores/auth.store';
import { reactive } from 'vue';
import { loginSchema } from '~/schemas/auth.schema';

const authStore = useAuthStore();

const form = reactive({
  email: 'digitlab.tech@gmail.com',
  password: 'Admin123',
  rememberMe: undefined,
});

const errors = reactive<Record<string, string>>({});

/**
 * Validate a specific field
 * @param field - The field to validate
 */
const validateField = (field: keyof typeof form) => {
  const result = loginSchema.safeParse(form);
  if (!result.success) {
    const fieldError = result.error.formErrors.fieldErrors[field]?.[0];
    errors[field] = fieldError || '';
  } else {
    errors[field] = '';
  }
};

/**
 * Handle form submission
 * @returns
 */
const handleSubmit = async () => {
  const result = loginSchema.safeParse(form);

  if (!result.success) {
    Object.entries(result.error.formErrors.fieldErrors).forEach(([field, err]) => {
      if (err && err[0]) {
        errors[field] = err[0];
      }
    });
    return;
  }

  await authStore.login(form);
  await navigateTo('/dashboard');
};
</script>
