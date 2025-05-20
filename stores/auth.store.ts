import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import useSupabaseClient from '@/composables/useSupabase';
import { useSessionPersistence } from '@/composables/useSessionPersistence';
import type { EventLog } from '@/types';
import { EventTypes } from '@/utils/index';

interface AuthStore {
  user: Ref<User | null>;
  session: Ref<Session | null>;
  loading: Ref<boolean>;
  lastAttempt: Ref<number>;
  lastActivity: Ref<number>;
  initialized: Ref<boolean>;
  SESSION_TIMEOUT: number;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: Credentials) => Promise<void>;
  signup: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  refreshSession: () => Promise<void>;
  syncUserProfile: () => Promise<any[] | undefined>;
  isAuthenticated: () => boolean;
  checkRateLimit: () => boolean;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const useAuthStore = defineStore('auth', (): AuthStore => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const lastAttempt = ref(0);
  const lastActivity = ref(Date.now());
  const initialized = ref(false);
  const initializationPromise = ref<Promise<void> | null>(null);

  // Constants
  const RATE_LIMIT_DELAY = 5000;
  const REMEMBER_ME_DURATION = 60 * 60 * 24 * 30;
  const DEFAULT_SESSION_DURATION = 60 * 60 * 24;
  const SESSION_TIMEOUT = 60 * 60 * 2;
  const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 15;

  // Dependencies
  const supabase = useSupabaseClient();
  const { saveSession, loadSession, clearSession } = useSessionPersistence();
  const toast   = useToast();

  // Core functions
  const setUser = (userCurrent: User | null) => {
    user.value = userCurrent;
    loading.value = false;
  };

  const setSession = (newSession: Session | null) => {
    session.value = newSession;
  };

  const setLoading = (load: boolean) => {
    loading.value = load;
  };

  const isAuthenticated = (): boolean => {
    return !!user.value?.id && !loading.value;
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now - lastAttempt.value < RATE_LIMIT_DELAY) {
      toast.show.error('Please wait before trying again');
      return false;
    }
    lastAttempt.value = now;
    return true;
  };

  // Authentication methods
  const login = async (credentials: Credentials) => {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (!error && data?.session) {
        data.session.expires_in = credentials.rememberMe ? REMEMBER_ME_DURATION : DEFAULT_SESSION_DURATION;

        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        localStorage.removeItem('sb-supabase-auth-token');

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          initialized.value = true;

          saveSession({
            user: data.session.user,
            tokens: {
              access: data.session.access_token,
              refresh: data.session.refresh_token,
            },
            preferences: { rememberMe: credentials.rememberMe },
            lastActivity: Date.now(),
            expiresAt: Date.now() + data.session.expires_in * 1000,
          });

          if (data.session.user?.id) {
            const profileStore = useProfileStore();
            await profileStore.fetchProfile(data.session.user.id);
          }
        }
      }
      const eventsLogStore = useEventsLogStore();

      if (error || !data) {
        toast.show.error(error?.message || 'Login failed');

        const eventLog = {
          eventType: EventTypes.LOGIN_FAILED,
          userId: '',
          createdAt: new Date(),
          metadata: { email: credentials.email, error: error?.message },
        } as unknown as EventLog;

        await eventsLogStore.createEventsLog(eventLog);
        throw error;
      }

      const successLog = {
        eventType: EventTypes.LOGIN_SUCCESS,
        userId: data.user.id,
        createdAt: new Date(),
        metadata: { email: data.user?.email },
        location: window.location.href,
      } as unknown as EventLog;

      await eventsLogStore.createEventsLog(successLog);
      toast.show.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (rememberMe = false) => {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.show.error(error.message || 'Google login failed');
        throw error;
      }
    } catch (error) {
      toast.show.error('Google login error: ' + (error as Error).message);
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        toast.show.error(error.message || 'Session refresh failed');
        console.error('Session refresh failed:', error);
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      toast.show.error('Session refresh error: ' + (error as Error).message);
      console.error('Session refresh error:', error);
      throw error;
    }
  };

  const syncUserProfile = async () => {
    if (!user.value) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.value.id,
          email: user.value.email,
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Profile sync failed:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Profile sync error:', error);
      throw error;
    }
  };

  const signup = async (credentials: Credentials) => {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error || !data) {
        const event = {
          eventType: EventTypes.SIGNUP_FAILED,
          userId: '',
          createdAt: new Date(),
          metadata: { email: data?.user?.email },
          location: window.location.href,
        } as unknown as EventLog;

        const eventsLogStore = useEventsLogStore();
        await eventsLogStore.createEventsLog(event);

        toast.show.error(error?.message || 'Signup failed');
        throw error;
      }

      setUser(data.user);

      if (data?.user?.id) {
        const eventLog = {
          eventType: EventTypes.SIGNUP_SUCCESS,
          userId: data.user.id,
          createdAt: new Date(),
          metadata: { email: data.user?.email },
          location: window.location.href,
        } as unknown as EventLog;

        const eventsLogStore = useEventsLogStore();
        await eventsLogStore.createEventsLog(eventLog);
      }

      toast.show.success('Account created successfully. Please check your email for verification.');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      clearSession();

      const { success } = await $fetch<{ success: boolean }>(`/api/auth/logout`, {
        method: 'POST',
      });

      const eventsLogStore = useEventsLogStore();

      const eventLog = {
        eventType: EventTypes.LOGOUT,
        userId: user.value?.id || '',
        createdAt: new Date(),
        metadata: { email: user.value?.email },
        location: window.location.href,
      } as unknown as EventLog;

      await eventsLogStore.createEventsLog(eventLog);

      setUser(null);
      setSession(null);

      toast.show.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      toast.show.success('Password reset link sent to your email');
    } catch (error) {
      toast.show.error('Failed to send reset link');
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.show.success('Password updated successfully');
    } catch (error) {
      toast.show.error('Failed to update password');
      console.error('Password update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const initAuth = async () => {
    if (initialized.value) return;

    if (await initializationPromise.value) {
      return await initializationPromise.value;
    }

    initializationPromise.value = (async () => {
      try {
        setLoading(true);

        // First try to restore from persisted session
        const persisted = loadSession();
        console.log(persisted);

        if (persisted?.tokens?.access) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: persisted.tokens.access,
              refresh_token: persisted.tokens.refresh,
            });

            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              initialized.value = true;
              return;
            }
          } catch (e) {
            console.warn('Failed to restore session from storage', e);
          }
        }

        // Fallback to current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session initialization error:', error);
          throw error;
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);

          saveSession({
            user: data.session.user,
            tokens: {
              access: data.session.access_token,
              refresh: data.session.refresh_token,
            },
            preferences: {},
            lastActivity: Date.now(),
            expiresAt: Date.now() + data.session.expires_in * 1000,
          });

          if (data.session.user?.id) {
            const profileStore = useProfileStore();
            await profileStore.fetchProfile(data.session.user.id);
          }
          localStorage.removeItem('supabase.auth.token');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        throw error;
      } finally {
        initialized.value = true;
        setLoading(false);
      }
    })();

    try {
      return await initializationPromise.value;
    } finally {
      initializationPromise.value = null;
    }
  };

  return {
    user,
    session,
    loading,
    lastAttempt,
    lastActivity,
    initialized,
    SESSION_TIMEOUT,
    setUser,
    setSession,
    setLoading,
    login,
    signup,
    logout,
    loginWithGoogle,
    refreshSession,
    syncUserProfile,
    isAuthenticated,
    checkRateLimit,
    updatePassword,
    resetPassword,
  };
});

// make sure to pass the right store definition, `useAuthStore` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
