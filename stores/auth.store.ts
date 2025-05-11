import { defineStore } from 'pinia';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'vue-sonner';
import type { EventLog } from '@/types';
import { EventTypes } from '~/server/services/events-log/index.service';

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * AuthStores interface
 * @description Store for authentication
 * @returns {AuthStores}
 * @example
 * const authStore = useAuthStore()
 * authStore.login({ email: '', password: '' })
 * authStore.signup({ email: '', password: '' })
 * authStore.logout()
 * authStore.loginWithGoogle()
 * authStore.refreshSession()
 * authStore.syncUserProfile()
 * authStore.isAuthenticated()
 * authStore.checkRateLimit()
 * authStore.initAuthListener()
 */
interface AuthStores {
  user: Ref<User | null>;
  session: Ref<Session | null>;
  loading: Ref<boolean>;
  lastAttempt: Ref<number>;
  setUser(user: User | null): void;
  setSession(session: Session | null): void;
  setLoading(loading: boolean): void;
  login(credentials: Credentials): Promise<void>;
  signup(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
  loginWithGoogle(rememberMe?: boolean): Promise<void>;
  refreshSession(): Promise<void>;
  syncUserProfile(): Promise<any[] | undefined>;
  isAuthenticated(): boolean;
  checkRateLimit(): boolean;
  initAuthListener(): void;
  updatePassword(newPassword: string): Promise<void>;
  resetPassword(email: string): Promise<void>;
}

export const useAuthStore = defineStore('auth', (): AuthStores => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref<boolean>(false);
  const lastAttempt = ref<number>(0);
  const lastActivity = ref<number>(Date.now());

  const RATE_LIMIT_DELAY = 5000; // 5 seconds
  const REMEMBER_ME_DURATION = 60 * 60 * 24 * 30; // 30 days
  const DEFAULT_SESSION_DURATION = 60 * 60 * 24; // 1 day
  const SESSION_TIMEOUT = 60 * 60 * 2; // 2 hours
  const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 15; // 15 minutes

  const supabase = useSupabaseClient();

  /**
   * Set user
   * @param userCurrent
   */
  function setUser(userCurrent: User | null) {
    user.value = userCurrent;
    loading.value = false;
  }

  /**
   * Set session
   * @param newSession
   */
  function setSession(newSession: Session | null) {
    session.value = newSession;
  }

  /**
   * Set loading
   * @param load
   */
  function setLoading(load: boolean) {
    loading.value = load;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  function isAuthenticated() {
    return !!user.value && !loading.value;
  }

  /**
   * Check rate limit
   * @returns {boolean}
   */
  function checkRateLimit(): boolean {
    const now = Date.now();
    if (now - lastAttempt.value < RATE_LIMIT_DELAY) {
      toast.error('Please wait before trying again');
      return false;
    }
    lastAttempt.value = now;
    return true;
  }

  /**
   * Initialize authentication listener
   */
  function initAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      logAuthEvent(event, session?.user?.email);

      if (event === 'SIGNED_IN') {
        setSession(session);
        setUser(session?.user ?? null);
        lastActivity.value = Date.now();
        startSessionTimer();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED') {
        lastActivity.value = Date.now();
      }
    });
  }

  /**
   * Start session timer
   */
  function startSessionTimer() {
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.value > SESSION_TIMEOUT * 1000) {
        clearInterval(timer);
        toast.warning('Your session has expired due to inactivity');
        logout();
      }
    }, 60000); // Check every minute
  }

  /**
   * Log authentication event
   * @param event
   * @param email
   */
  function logAuthEvent(event: string, email?: string | null) {
    supabase.from('auth_audit_log').insert({
      event_type: event,
      user_email: email,
      ip_address: '', // Will be set by server
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Login with email and password
   * @param credentials
   */
  async function login(credentials: Credentials) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      // SignIn with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      const eventsLogStore = useEventsLogStore();

      // Check for error
      if (error || !data) {
        toast.error(error?.message || 'Login failed');

        // Log the login failed event
        const event = {
          eventType: EventTypes.LOGIN_FAILED,
          userId: '',
          ipHash: useRequestHeaders(['x-forwarded-for'])?.['x-forwarded-for'] || '',
          userAgent: useRequestHeaders(['user-agent'])?.['user-agent'] || '',
          createdAt: new Date(),
          metadata: { email: credentials.email, error: error?.message },
        } as unknown as EventLog;

        await eventsLogStore.createEventsLog(event);

        throw error;
      }

      // Set session and user
      setSession(data.session);
      setUser(data.user);

      // Fetch user profile after successful login
      const profileStore = useProfileStore();
      await profileStore.fetchProfile(data.user.id);

      // Log the login success event
      const event = {
        eventType: EventTypes.LOGIN_SUCCESS,
        userId: data.user.id,
        ipHash: useRequestHeaders(['x-forwarded-for'])?.['x-forwarded-for'] || '',
        userAgent: useRequestHeaders(['user-agent'])?.['user-agent'] || '',
        createdAt: new Date(),
        metadata: { email: data.user.email },
      } as unknown as EventLog;

      await eventsLogStore.createEventsLog(event);

      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Login with Google
   * @param rememberMe
   */
  async function loginWithGoogle(rememberMe = false) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      //const supabase = useSupabaseClient();
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
        toast.error(error.message || 'Google login failed');
        throw error;
      }
    } catch (error) {
      toast.error('Google login error: ' + (error as Error).message);
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Refresh session
   */
  async function refreshSession() {
    try {
      //const supabase = useSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        toast.error(error.message || 'Session refresh failed');
        console.error('Session refresh failed:', error);
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      toast.error('Session refresh error: ' + (error as Error).message);
      console.error('Session refresh error:', error);
      throw error;
    }
  }

  /**
   * Sync user profile with Supabase
   */
  async function syncUserProfile() {
    if (!user.value) return;

    try {
      //const supabase = useSupabaseClient();
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
  }

  /**
   * Signup with email and password
   * @param credentials
   */
  async function signup(credentials: Credentials) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      //const supabase = useSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        toast.error(error.message || 'Signup failed');
        throw error;
      }

      setUser(data.user);
      toast.success('Account created successfully. Please check your email for verification.');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout
   */
  async function logout() {
    setLoading(true);
    try {
      //const supabase = useSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message || 'Logout failed');
        throw error;
      }

      const eventsLogStore = useEventsLogStore();
      const authStore = useAuthStore();

      // Log the login failed event
      const event = {
        eventType: EventTypes.LOGOUT,
        userId: authStore.user?.id || '',
        ipHash: useRequestHeaders(['x-forwarded-for'])?.['x-forwarded-for'] || '',
        userAgent: useRequestHeaders(['user-agent'])?.['user-agent'] || '',
        createdAt: new Date(),
        metadata: { email: authStore.user?.email },
      } as unknown as EventLog;

      await eventsLogStore.createEventsLog(event);

      setUser(null);
      setSession(null);

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset password
   * @param email
   */
  async function resetPassword(email: string) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error('Failed to send reset link');
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  /**
   * Update password
   * @param newPassword
   */
  async function updatePassword(newPassword: string) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
      console.error('Password update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    session,
    loading,
    lastAttempt,
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
    initAuthListener,
    resetPassword,
    updatePassword,
  };
});

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
