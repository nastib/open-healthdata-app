import { ProfileServices } from "~/server/services/profile/index.service"
import type { ProfileWithRoles } from '~/server/schemas/profile.schema'
import prisma from '@/server/utils/prisma'

interface IPermissions {
  // Variable permissions
  canCreate(profile: ProfileWithRoles): Promise<boolean>
  canUpdate(profile: ProfileWithRoles, variableId: number): Promise<boolean>
  canDelete(profile: ProfileWithRoles, variableId: number): Promise<boolean>
  canView(profile: ProfileWithRoles, variableId: number): Promise<boolean>
  canViewAll(profile: ProfileWithRoles): Promise<boolean>
}

/**
* Permissions Class for granular access control
*/
export class VariablesPermissions implements IPermissions {

/////////////////////////////////////////////////
// Variable permissions
/////////////////////////////////////////////////

  /**
   * Checks if user can view all variables
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
   * Checks if user can view a specific variable
   * @param user - Authenticated user
   * @param variableId - ID of variable to view
   * @returns boolean - true if user has any data role and org access
   */
  async canView(profile: ProfileWithRoles, variableId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()
    if (!await hasRole(profile, 'VIEWER') &&
        !(await hasRole(profile,'CREATOR')) &&
        !(await hasRole(profile, 'ADMIN'))) {
      return false
    }

    const variable = await prisma.variable.findUnique({
      where: { id: variableId },
      include: { dataEntries: true }
    })

    if (!variable) return false

    // Allow view if user is admin or has org access
    return await hasRole(profile,'ADMIN') ||
           variable.dataEntries.some((entry: { organizationElementCode: string }) =>
             entry.organizationElementCode === profile.organizationElementCode
           )
  }

  /**
   * Checks if user can create variables
   * @param user - Authenticated user
   * @returns boolean - true if user has ADMIN or CREATOR role with org access
   */
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    return (await hasRole(profile,'ADMIN')) ||
           (await hasRole(profile, 'CREATOR') &&
           !!profile.organizationElementCode)
  }

  /**
   * Checks if user can update a specific variable
   * @param user - Authenticated user
   * @param variableId - ID of variable to update
   * @returns boolean - true if user has ADMIN role or org has entries using this variable
   */
  async canUpdate(profile: ProfileWithRoles, variableId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (await hasRole(profile, 'ADMIN')) return true

    const variable = await prisma.variable.findUnique({
      where: { id: variableId },
      include: { dataEntries: true }
    })

    if (!variable) return false

    // Check if user's org has entries using this variable
    return variable.dataEntries.some((entry: { organizationElementCode: string }) =>
      entry.organizationElementCode === profile.organizationElementCode
    )
  }

  /**
   * Checks if user can delete a specific variable
   * @param user - Authenticated user
   * @param variableId - ID of variable to delete
   * @returns boolean - true if user has ADMIN role and variable has no entries
   */
  async canDelete(profile: ProfileWithRoles, variableId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices()

    if (!await hasRole(profile,'ADMIN')) return false

    const variable = await prisma.variable.findUnique({
      where: { id: variableId },
      include: { dataEntries: true }
    })

    if (!variable) return false

    // Only allow deletion if variable has no associated entries
    return variable.dataEntries.length === 0
  }
}
