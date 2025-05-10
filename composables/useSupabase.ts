import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_STATE_KEY = 'supabase:client'

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

  // Only use state on client-side to avoid SSR serialization issues
  if (import.meta.client) {
    const supabase = useState<SupabaseClient>(SUPABASE_STATE_KEY, () => {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          storageKey: 'supabase.auth.token',
          persistSession: true,
          autoRefreshToken: true
        }
       })

      // Add reset capability for testing
      Object.defineProperty(client, 'reset', {
        value: () => {
          useState(SUPABASE_STATE_KEY).value = null
        },
        writable: false,
        configurable: true
      })

      return client
    })

    return supabase.value
  }

  // Return new client instance for SSR
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: 'supabase.auth.token',
      persistSession: false, // Disable session persistence during SSR
      autoRefreshToken: false
    }
  })
}
