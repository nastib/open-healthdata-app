<script setup lang="ts">
import { useVariablesStore } from '@/stores/variables.store';
import { ref, reactive } from 'vue';
import { CreateVariableInput } from '~/server/schemas/variables.schema';
import type { z } from 'zod';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import useToast from '~/composables/useToast';

const variablesStore = useVariablesStore();
const loading = ref(false);
const form = reactive({
  code: '',
  designation: '',
  dataSourceId: 0,
  categoryCode: '',
  frequency: '',
  level: '',
  type: [],
});
const toast = useToast();

const emit = defineEmits(['success']);

const onSubmit = async () => {
  if (!form.code) return;

  loading.value = true;
  try {
    await variablesStore.createVariable({
      ...form,
    });
    toast.show.success('Variable created successfully');
    emit('success');
  } catch (error) {
    toast.show.error('Failed to create variable');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="space-y-2">
      <Label for="code">Code</Label>
      <Input id="code" v-model="form.code" required />
    </div>

    <div class="space-y-2">
      <Label for="designation">Designation</Label>
      <Input id="designation" v-model="form.designation" />
    </div>

    <div class="space-y-2">
      <Label for="dataSourceId">Data Source ID</Label>
      <Input id="dataSourceId" v-model.number="form.dataSourceId" type="number" required />
    </div>

    <div class="space-y-2">
      <Label for="categoryCode">Category Code</Label>
      <Input id="categoryCode" v-model="form.categoryCode" required />
    </div>

    <Button type="submit" :disabled="loading">
      {{ loading ? 'Creating...' : 'Create Variable' }}
    </Button>
  </form>
</template>
