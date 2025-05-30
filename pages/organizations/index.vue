<template>
  <div>
    DataSources
    <pre>{{ organizations }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useOrganizationsStore } from '@/stores/organizations.store';
const { organizations } = storeToRefs(useOrganizationsStore());
const { fetchOrganizations } = useOrganizationsStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Organization',
  description: 'Organization',
  keywords: 'Organization',
  auth: true,
  roles: roles,
});
onBeforeMount(async () => {
  await fetchOrganizations();
});
</script>

<style></style>
