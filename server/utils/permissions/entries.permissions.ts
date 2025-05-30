import { ProfileServices } from "~/server/services/profile/index.service"
import type { ProfileWithRoles } from '~/server/schemas/profile.schema'
import prisma from '@/server/utils/prisma'

interface IPermissions {
  // Data Entry permissions
  canCreate(profile: ProfileWithRoles): Promise<boolean>
  canUpdate(profile: ProfileWithRoles, entryId: number): Promise<boolean>
  canDelete(profile: ProfileWithRoles, entryId: number): Promise<boolean>
  canView(profile: ProfileWithRoles, entryId: number): Promise<boolean>
  canViewAll(profile: ProfileWithRoles): Promise<boolean>
}

/**
* Permissions Class for granular access control
*/
export class EntriesPermissions implements IPermissions {

/////////////////////////////////////////////////
// Data Entry permissions
/////////////////////////////////////////////////

  /**
   * Checks if user can view a all data entry
   * @param user - Authenticated user
   * @returns boolean - true if user has any data role and org access
   */
  async canViewAll(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    if (!await hasRole(profile, 'VIEWER') &&
        !(await hasRole(profile,'CREATOR')) &&
        !(await hasRole(profile, 'ADMIN'))) {
      return false
    }

    return true
  }

  /**
   * Checks if user can view a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to view
   * @returns boolean - true if user has any data role and org access
   */
  async canView(profile: ProfileWithRoles, entryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    if (!await hasRole(profile, 'VIEWER') &&
        !(await hasRole(profile,'CREATOR')) &&
        !(await hasRole(profile, 'ADMIN'))) {
      return false
    }

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Allow view if user is admin or has org access
    return await hasRole(profile,'ADMIN') ||
           entry.organizationElementCode === profile.organizationElementCode
  }

  /**
   * Checks if user can create data entries
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN or DATA_CREATOR role with org access
   */
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    return (await hasRole(profile,'ADMIN')) ||
           (await hasRole(profile, 'CREATOR') &&
           !!profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canUpdate(profile: ProfileWithRoles, entryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (await hasRole(profile, 'DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === profile.organizationElementCode
  }

  /**
   * Checks if user can delete a specific data entry
   * @param user - Authenticated user
   * @param entryId - ID of entry to delete
   * @returns boolean - true if user has DATA_ADMIN role or owns the entry
   */
  async canDelete(profile: ProfileWithRoles, entryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (await hasRole(profile,'DATA_ADMIN')) return true

    const entry = await prisma.dataEntry.findUnique({
      where: { id: entryId }
    })

    if (!entry) return false

    // Check if user's org owns this entry
    return entry.organizationElementCode === profile.organizationElementCode
  }
}
