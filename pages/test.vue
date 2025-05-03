<script setup lang="ts">
import { Button } from '@/components/ui/button';
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Button Component Test</h1>

    <div class="space-y-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive" class="text-white">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      <div class="pt-4">
        <Button size="sm">Small</Button>
        <Button class="ml-2">Default</Button>
        <Button size="lg" class="ml-2">Large</Button>
      </div>
    </div>
  </div>
</template>
