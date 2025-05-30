<script setup lang="ts">
import type { Variable } from '@prisma/client';
import { useVariablesStore } from '@/stores/variables.store';
const route = useRoute();
const variablesStore = useVariablesStore();
const loading = ref(false);
const variable = ref<Variable | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    await variablesStore.fetchVariableById(Number(route.params.id));
    variable.value = variablesStore.selectedVariable;
  } catch (error) {
    // Error handled in store
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading">
      <Loader />
    </div>

    <div v-else-if="variable">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">{{ variable.code }}</h1>
        <Button as-child>
          <NuxtLink :to="`/variables/${variable.id}/edit`"> Edit </NuxtLink>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label>Code</Label>
            <p>{{ variable.code }}</p>
          </div>
          <div>
            <Label>Description</Label>
            <p>{{ variable.designation || '-' }}</p>
          </div>
          <div>
            <Label>Created</Label>
            <p>{{ variable.createdAt ? new Date(variable.createdAt).toLocaleDateString() : '' }}</p>
          </div>
          <div>
            <Label>Updated</Label>
            <p>{{ new Date(variable.updatedAt).toLocaleDateString() }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else>
      <p>Variable not found</p>
    </div>
  </div>
</template>
