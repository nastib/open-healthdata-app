import { createClient, SupabaseClient } from '@supabase/supabase-js'

export default function useSupabaseClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.SUPABASE_URL as string
  const supabaseKey = config.public.SUPABASE_KEY as string

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase configuration. ' +
      'Provide url/key parameters or set SUPABASE_URL/SUPABASE_KEY in environment variables.'
    )
  }

  // Return new client instance for SSR
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      //storageKey: 'sb-supabase-auth-token'
    }
  })
}
