import { defineStore } from 'pinia';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'vue-sonner';

interface Credentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

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
}

export const useAuthStore = defineStore('auth', (): AuthStores => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref<boolean>(false);
  const lastAttempt = ref<number>(0);
  const RATE_LIMIT_DELAY = 5000; // 5 seconds
  const REMEMBER_ME_DURATION = 60 * 60 * 24 * 30; // 30 days
  const DEFAULT_SESSION_DURATION = 60 * 60 * 24; // 1 day

  function setUser(userCurrent: User | null) {
    user.value = userCurrent;
    loading.value = false;
  }

  function setSession(newSession: Session | null) {
    session.value = newSession;
  }

  function setLoading(load: boolean) {
    loading.value = load;
  }

  function isAuthenticated() {
    return !!user.value && !loading.value;
  }

  function checkRateLimit(): boolean {
    const now = Date.now();
    if (now - lastAttempt.value < RATE_LIMIT_DELAY) {
      toast.error('Please wait before trying again');
      return false;
    }
    lastAttempt.value = now;
    return true;
  }

  function initAuthListener() {
    const supabase = useSupabase();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
      }
    });
  }

  async function login(credentials: Credentials) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        toast.error(error.message || 'Login failed');
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(rememberMe = false) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        toast.error(error.message || 'Google login failed');
        throw error;
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function refreshSession() {
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh failed:', error);
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
    } catch (error) {
      console.error('Session refresh error:', error);
      throw error;
    }
  }

  async function syncUserProfile() {
    if (!user.value) return;

    try {
      const supabase = useSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.value.id,
          email: user.value.email,
          updated_at: new Date().toISOString()
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

  async function signup(credentials: Credentials) {
    if (!checkRateLimit()) return;

    setLoading(true);
    try {
      const supabase = useSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
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

  async function logout() {
    setLoading(true);
    try {
      const supabase = useSupabase();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message || 'Logout failed');
        throw error;
      }

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
      initAuthListener
    };

})

