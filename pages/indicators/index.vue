<template>
  <div>
    Indicators
    <pre>{{ indicators }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useIndicatorsStore } from '@/stores/indicators.store';
const { indicators } = storeToRefs(useIndicatorsStore());
const { fetchIndicators } = useIndicatorsStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Indicators',
  description: 'Indicators',
  keywords: 'Indicators',
  auth: true,
  roles: roles,
});
onBeforeMount(async () => {
  await fetchIndicators();
});
</script>

<style></style>
