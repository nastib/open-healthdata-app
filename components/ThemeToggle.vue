<template>
  <Button variant="ghost" size="icon" @click="toggleTheme" aria-label="Toggle theme">
    <Icon :name="theme === 'dark' ? 'lucide:sun' : 'lucide:moon'" class="h-5 w-5" />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
const theme = useState('theme', () => 'light');

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
};
</script>
