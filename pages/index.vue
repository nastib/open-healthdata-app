<template>
  <div>
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <h1>Welcome to Open Health Data App</h1>
        <p>This is the landing page</p>
        <p>Window width: {{ width }}px</p>
      </CardContent>
      <CardFooter>
        <Button>Click Me</Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core';
import Card from '~/components/ui/card/Card.vue';

const { width } = useWindowSize();
</script>
