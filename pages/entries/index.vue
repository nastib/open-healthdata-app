<template>
  <div>
    Data Entries
    <pre>{{ entries }}</pre>
  </div>
</template>

<script lang="ts" setup>
import type { DataEntry } from '@prisma/client';
import { useEntriesStore } from '~/stores/entries-store';
const { entries } = storeToRefs(useEntriesStore());
const { fetchEntries } = useEntriesStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Data Entries',
  auth: true,
  roles: roles,
});

onBeforeMount(async () => {
  await fetchEntries();
});
</script>

<style></style>
