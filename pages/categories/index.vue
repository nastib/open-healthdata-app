<template>
  <div>
    Data Entries
    <pre>{{ categories }}</pre>
  </div>
</template>

<script lang="ts" setup>
import type { DataCategory } from '@/types';
import { useCategoriesStore } from '@/stores/categories-store';
const { categories } = storeToRefs(useCategoriesStore());
const { fetchCategories } = useCategoriesStore();

const roles = ['ADMIN', 'USER', 'GUEST', 'VIEWER'];
definePageMeta({
  layout: 'default',
  title: 'Data Categories',
  auth: true,
  roles: roles,
});
onBeforeMount(async () => {
  await fetchCategories();
});
</script>

<style></style>
