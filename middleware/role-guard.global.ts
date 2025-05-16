import { useSessionPersistence } from '@/composables/useSessionPersistence';
import type { User } from '@supabase/supabase-js';
import type { RouteLocationNormalizedLoaded } from 'vue-router';

export default defineNuxtRouteMiddleware(async to => {
  // Skip middleware for auth pages
  if (to.path.startsWith('/auth')) return;

  // Only apply on client-side to avoid SSR serialization issues
  if (import.meta.client) {
    const authStore = useAuthStore();
    const { isAuthenticated, setSession, setUser } = authStore;
    const { initialized, user } = storeToRefs(authStore);
    const { loadSession, isLocalStorageAvailable } = useSessionPersistence();

    // Try to restore session if not authenticated
    if (!isAuthenticated()) {
      if (isLocalStorageAvailable) {
        const persisted = loadSession();

        if (persisted?.tokens?.access) {
          try {
            const supabase = useSupabaseClient();
            const { data, error } = await supabase.auth.setSession({
              access_token: persisted.tokens.access,
              refresh_token: persisted.tokens.refresh,
            });

            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              initialized.value = true;

              await pathRolesChecking(user.value, to); // Commented out

              return;
            }
          } catch (e) {
            console.error('Session restore failed:', e);
          }
        }
      }

      // Only redirect to login if not already going there
      if (to.path !== '/auth/login') {
        return navigateTo({
          path: '/auth/login',
          query: { redirect: to.path },
        });
      }
    }

    await pathRolesChecking(user.value, to); // Commented out
    return;
  } else {
    return;
  }
});

async function pathRolesChecking(user: User | null, to: RouteLocationNormalizedLoaded) {
  const profileStore = useProfileStore();
  if (!profileStore.profile && user?.id) {
    await profileStore.fetchProfile(user?.id);

    localStorage.removeItem('supabase.auth.token');

    // Check route meta for required roles
    if (to.meta.roles) {
      const { hasAnyRole } = useRoles();
      const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles];

      if (!hasAnyRole(requiredRoles)) {
        // Only redirect to unauthorized if not already going there
        if (to.path !== '/unauthorized') {
          return navigateTo('/unauthorized');
        }
        return;
      }
    }
  }
}


