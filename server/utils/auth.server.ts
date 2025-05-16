import prisma from './prisma'
import { H3Event } from 'h3'
import { useRoles } from '@/composables/useRoles'
import useSupabaseClient from '@/composables/useSupabase'
import { ProfileWithRoles } from '~/types'
import { Permissions } from '@/server/utils/permissions'

export interface IAuthUser {
  id: string;
  email: string;
  profile: ProfileWithRoles;
  hasRole: (roleCode: string) => boolean;
}

export interface IAuthServer {
  getAuthenticatedUser(event: H3Event): Promise<IAuthUser>
  getPermissions(): Permissions

}
/**
 *  Resources authorization & permissions management
 */
export class AuthServer implements IAuthServer {
  private permissions = new Permissions()

  /**
   * Retrieves the authenticated user from Supabase and their profile from Prisma.
   * If the user is not authenticated or does not have a profile, an error is thrown.
   * @param event
   * @returns Authenticated user with permissions
   */
  async getAuthenticatedUser(event: H3Event): Promise<IAuthUser> {
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
    }) as ProfileWithRoles

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

  /**
   * Gets the permissions instance for granular access control
   * @returns Permissions instance
   */
  getPermissions(): Permissions {
    return this.permissions
  }
}


