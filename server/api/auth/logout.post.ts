import { H3Event, EventHandlerRequest } from 'h3';
import { serverSupabaseClient } from '#supabase/server';

// server/api/logout.js
export default defineEventHandler(async event => {
  const supabase = await serverSupabaseClient(event);

  // Sign out
  await supabase.auth.signOut();

  // Manually clear cookies if needed
  setCookie(event, 'sb-supabase-auth-token', '', {
    expires: new Date(0),
  });

  return {
    success: true,
  };
});
