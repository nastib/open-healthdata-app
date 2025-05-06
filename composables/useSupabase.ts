import { createClient } from '@supabase/supabase-js'

export default function useSupabaseClient() {

const config = useRuntimeConfig()

const supabaseUrl = config.public.SUPABASE_URL as string
const supabaseKey = config.public.SUPABASE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is not defined in environment variables.')
  throw new Error('Missing Supabase configuration')
}

const supabase = createClient(supabaseUrl, supabaseKey)

return supabase

}
