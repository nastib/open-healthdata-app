<template>
  <div>
    Variables
    <pre>{{ variables }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useVariablesStore } from '@/stores/variables.store';
const { variables } = storeToRefs(useVariablesStore());
const { fetchVariables } = useVariablesStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Variables',
  description: 'Variables',
  keywords: 'Variables',
  auth: true,
  roles: roles,
});
onBeforeMount(async () => {
  await fetchVariables();
});
</script>

<style></style>
