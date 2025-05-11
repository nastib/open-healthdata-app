import prisma from './prisma'
import { H3Event } from 'h3'
import { useRoles } from '@/composables/useRoles'
import useSupabaseClient from '@/composables/useSupabase'

/**
 * Retrieves the authenticated user from Supabase and their profile from Prisma.
 * If the user is not authenticated or does not have a profile, an error is thrown.
 * @param event
 * @returns
 */
export async function getAuthenticatedUser(event: H3Event) {
  const supabase = useSupabaseClient()
  const { data: { user: authUser }, error } = await supabase.auth.getUser()

  if (error || !authUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: authUser.id },
    include: { roles: true }
  })

  if (!profile) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - No profile found'
    })
  }

  return {
    id: authUser.id,
    email: authUser.email,
    profile,
    hasRole: (roleCode: string) => useRoles().hasRole(roleCode)
  }
}
