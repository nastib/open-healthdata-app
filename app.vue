<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster richColors position="top-right" />
  </div>
</template>

<script lang="ts" setup>
import { Toaster } from 'vue-sonner';
</script>
