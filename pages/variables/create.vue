<script setup lang="ts">
import VariableForm from '~/components/variables/VariableForm.vue';

const handleSuccess = () => {
  navigateTo('/variables');
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Create Variable</h1>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Create New Variable</CardTitle>
      </CardHeader>
      <CardContent>
        <VariableForm @success="handleSuccess" />
      </CardContent>
    </Card>
  </div>
</template>
