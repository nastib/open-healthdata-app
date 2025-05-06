<template>
  <div class="max-w-md mx-auto mt-10 p-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <div class="grid gap-4">
            <div class="grid gap-2">
              <Label for="password">New Password</Label>
              <Input id="password" type="password" v-model="form.password" required />
            </div>
            <div class="grid gap-2">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" v-model="form.confirmPassword" required />
            </div>
            <Button type="submit" class="w-full" :disabled="loading">
              <Loader :loading="loading" size="sm" aria-label="Resetting password" />
              <span>Reset Password</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'auth',
});

const supabase = useSupabase();
const route = useRoute();
const router = useRouter();
const loading = ref(false);

const form = reactive({
  password: '',
  confirmPassword: '',
});

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  loading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: form.password,
    });

    if (error) throw error;
    toast.success('Password updated successfully');
    router.push('/dashboard');
  } catch (error: any) {
    toast.error(error?.message || 'Failed to reset password');
  } finally {
    loading.value = false;
  }
};
</script>
