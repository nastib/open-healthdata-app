<template>
  <div>
    DataSources
    <pre>{{ sources }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useSourcesStore } from '@/stores/sources.store';
const { sources } = storeToRefs(useSourcesStore());
const { fetchSources } = useSourcesStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Data Sources',
  description: 'Data Sources',
  keywords: 'Data Sources',
  auth: true,
  roles: roles,
});
onBeforeMount(async () => {
  await fetchSources();
});
</script>

<style></style>
