<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <FormKit
      type="form"
      @submit="
        e => {
          e.preventDefault();
          console.log('Form submitted');
        }
      "
    >
      <p class="text-2xl font-bold underline">login</p>
      <FormKit type="text" label="Name:" />
      <FormKit type="password" label="Password:" />
    </FormKit>
  </div>
</template>

<script lang="ts" setup>
//import { FormKit } from '@formkit/vue';
</script>
<style></style>
