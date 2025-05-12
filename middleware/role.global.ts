
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const profileStore = useProfileStore();

  // Skip middleware for auth pages and prevent redirect loops
  if (to.path.startsWith('/auth') || to.path === '/auth/login') return;

  // Redirect to login if not authenticated (avoid infinite loop)
  if (!authStore.isAuthenticated() && to.path !== '/auth/login') {
    return navigateTo('/auth/login');
  }

  // Fetch profile if not loaded
  if (!profileStore.profile && authStore.user?.id) {
    await profileStore.fetchProfile(authStore.user.id);
  }

  // Check route meta for required roles
  if (to.meta.roles) {
    const { hasAnyRole } = useRoles();
    const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles];

    if (!hasAnyRole(requiredRoles)) {
      return navigateTo('/unauthorized');
    }

    return // Explicitly continue navigation
  }
});
