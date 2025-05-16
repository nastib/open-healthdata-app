<template>
  <footer class="border-t bg-background py-6">
    <div class="container flex flex-col items-center justify-around gap-4 md:flex-row">
      <p class="text-sm text-muted-foreground">© {{ currentYear }} OpenHealthData. All rights reserved.</p>
      <nav aria-label="Footer navigation">
        <ul class="flex items-center space-x-4">
          <li>
            <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Privacy Policy">
              Privacy Policy
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/" class="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Terms of Service">
              Terms of Service
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const links = ref<string[]>(['/privacy', '/terms']);
</script>
