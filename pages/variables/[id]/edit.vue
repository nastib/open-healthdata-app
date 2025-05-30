<script setup lang="ts">
import type { Variable } from '~/server/schemas/variables.schema';
import { useVariablesStore } from '@/stores/variables.store';
import VariableForm from '~/components/variables/VariableForm.vue';

const route = useRoute();
const variablesStore = useVariablesStore();
const loading = ref(false);
const variable = ref<Variable | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    await variablesStore.fetchVariableById(Number(route.params.id) as number);
    variable.value = variablesStore.selectedVariable as Variable;
  } catch (error) {
    // Error handled in store
  } finally {
    loading.value = false;
  }
});

const handleSuccess = () => {
  navigateTo(`/variables/${route.params.id}`);
};
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading">
      <Loader />
    </div>

    <div v-else-if="variable">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Edit Variable</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Variable</CardTitle>
        </CardHeader>
        <CardContent>
          <VariableForm :variable="variable" @success="handleSuccess" />
        </CardContent>
      </Card>
    </div>

    <div v-else>
      <p>Variable not found</p>
    </div>
  </div>
</template>
