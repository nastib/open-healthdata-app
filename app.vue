<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster richColors position="top-right" />
  </div>
</template>

<script lang="ts" setup>
import { Toaster, toast } from 'vue-sonner';
</script>
