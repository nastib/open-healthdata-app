<template>
  <div class="max-w-md mx-auto mt-10 p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Sign Up</CardTitle>
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
              <Input id="password" type="password" v-model="form.password" @blur="validateField('password')" />
              <p v-if="errors.password" class="text-sm text-red-500">
                {{ errors.password }}
              </p>
            </div>
            <div class="grid gap-2">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" v-model="form.confirmPassword" @blur="validateField('confirmPassword')" />
              <p v-if="errors.confirmPassword" class="text-sm text-red-500">
                {{ errors.confirmPassword }}
              </p>
            </div>
            <Button type="submit" class="w-full" :disabled="authStore.loading || !form.email || !form.password || !form.confirmPassword">
              <Loader :loading="authStore.loading" size="sm" aria-label="Logging in" />
              <span v-if="authStore.loading">Creating account...</span>
              <span v-else>Sign Up</span>
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter class="text-sm text-center">
        Already have an account? <NuxtLink to="/auth/login" class="underline">Login</NuxtLink>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
});

import { signupSchema } from '~/schemas/auth';

const authStore = useAuthStore();
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
});
const errors = reactive<Record<string, string>>({});

const validateField = (field: keyof typeof form) => {
  const result = signupSchema.safeParse(form);
  if (!result.success) {
    const fieldError = result.error.formErrors.fieldErrors[field]?.[0];
    errors[field] = fieldError || '';
  } else {
    errors[field] = '';
  }
};

const handleSubmit = async () => {
  const result = signupSchema.safeParse(form);
  if (!result.success) {
    Object.entries(result.error.formErrors.fieldErrors).forEach(([field, err]) => {
      if (err && err[0]) {
        errors[field] = err[0];
      }
    });
    return;
  }

  try {
    await authStore.signup({
      email: form.email,
      password: form.password,
    });
    await navigateTo('/dashboard');
  } catch (error) {
    // Errors are already handled by the auth store
  }
};
</script>
