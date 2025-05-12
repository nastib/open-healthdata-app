import prisma from './prisma'
import { H3Event } from 'h3'
import { useRoles } from '@/composables/useRoles'
import useSupabaseClient from '@/composables/useSupabase'
import { ProfileWithRoles } from '~/types'

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


interface IPermissions {
  // Data categories permissions
  canCreateDataCategory(user: IAuthUser): Promise<boolean>
  canUpdateDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>
  canDeleteDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>
  canViewDataCategory(user: IAuthUser, categoryId: number): Promise<boolean>

  // Data entries permissions
  canCreateDataEntry(user: IAuthUser): Promise<boolean>
  canUpdateDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
  canDeleteDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
  canViewDataEntry(user: IAuthUser, entryId: number): Promise<boolean>
}

class Permissions implements IPermissions {
  /**
   * Checks if user can view a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to view
   * @returns boolean - true if user has any data role and org access
   */
  async canViewDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_VIEWER') &&
        !user.hasRole('DATA_CREATOR') &&
        !user.hasRole('DATA_ADMIN')) {
      return false
    }

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Allow view if user is admin or has org access
    return user.hasRole('DATA_ADMIN') ||
           entry.organizationElementCode === user.profile.organizationElementCode
  }
  /**
   * Checks if user can create data categories
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN role or is organization data manager
   */
  async canCreateDataCategory(user: IAuthUser): Promise<boolean> {
    return user.hasRole('DATA_ADMIN') ||
           (user.hasRole('DATA_CREATOR') &&
           !!user.profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the category
   */
  async canUpdateDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true }
    })

    if (!category) return false

    // Check if user's org has entries in this category
    return category.dataEntries.some(entry =>
      entry.organizationElementCode === user.profile.organizationElementCode
    )
  }

  /**
   * Checks if user can delete a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to delete
   * @returns boolean - true if user has DATA_ADMIN role and category is empty
   */
  async canDeleteDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_ADMIN')) return false

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: {
        dataEntries: true,
        indicators: true,
        variables: true
      }
    })

    if (!category) return false

    // Only allow deletion if category has no associated data
    return category.dataEntries.length === 0 &&
           category.indicators.length === 0 &&
           category.variables.length === 0
  }

  /**
   * Checks if user can view a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to view
   * @returns boolean - true if user has any data role and org access
   */
  async canViewDataCategory(user: IAuthUser, categoryId: number): Promise<boolean> {
    if (!user.hasRole('DATA_VIEWER') &&
        !user.hasRole('DATA_CREATOR') &&
        !user.hasRole('DATA_ADMIN')) {
      return false
    }

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true }
    })

    if (!category) return false

    // Allow view if user is admin or has org access
    return user.hasRole('DATA_ADMIN') ||
           category.dataEntries.some(entry =>
             entry.organizationElementCode === user.profile.organizationElementCode
           )
  }

  /**
   * Checks if user can create data entries
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN or DATA_CREATOR role with org access
   */
  async canCreateDataEntry(user: IAuthUser): Promise<boolean> {
    return user.hasRole('DATA_ADMIN') ||
           (user.hasRole('DATA_CREATOR') &&
           !!user.profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canUpdateDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === user.profile.organizationElementCode
  }

  /**
   * Checks if user can delete a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to delete
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canDeleteDataEntry(user: IAuthUser, entryId: number): Promise<boolean> {
    if (user.hasRole('DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === user.profile.organizationElementCode
  }
}
