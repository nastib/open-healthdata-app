import { ProfileServices } from '~/server/services/profile/index.service';
import { ProfileWithRoles } from '~/server/schemas/profile.schema';
import prisma from '~/server/utils/prisma';
import type { OrganizationElement } from '@prisma/client';

interface IPermissions {
  // Organization permissions
  canCreate(profile: ProfileWithRoles): Promise<boolean>;
  canUpdate(profile: ProfileWithRoles, organizationId: number): Promise<boolean>;
  canDelete(profile: ProfileWithRoles, organizationId: number): Promise<boolean>;
  canView(profile: ProfileWithRoles, organizationId: number): Promise<boolean>;
  canViewAll(profile: ProfileWithRoles): Promise<boolean>;
}

/**
 * Permissions Class for granular access control for Organizations
 */
export class OrganizationsPermissions implements IPermissions {
  /////////////////////////////////////////////////
  // Organization permissions
  /////////////////////////////////////////////////

  /**
   * Checks if user can create organizations
   * @param profile - Authenticated user profile
   * @returns boolean - true if user has ADMIN or CREATOR role and is associated with an organization
   */
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    return (await hasRole(profile, 'ADMIN')) || ((await hasRole(profile, 'CREATOR')) && !!profile.organizationElementCode);
  }

  /**
   * Checks if user can update a specific organization
   * @param profile - Authenticated user profile
   * @param organizationId - ID of organization to update
   * @returns boolean - true if user has ADMIN role or is the data manager of the organization
   */
  async canUpdate(profile: ProfileWithRoles, organizationId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (await hasRole(profile, 'ADMIN')) return true;

    const organization = await prisma.organizationElement.findUnique({
      where: { id: organizationId },
    });

    if (!organization) return false;

    // Check if the user is the data manager for this organization
    return organization.dataManagerId === profile.userId;
  }

  /**
   * Checks if user can delete a specific organization
   * @param profile - Authenticated user profile
   * @param organizationId - ID of organization to delete
   * @returns boolean - true if user has ADMIN role and organization has no associated data entries or profiles
   */
  async canDelete(profile: ProfileWithRoles, organizationId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    if (!(await hasRole(profile, 'ADMIN'))) return false;

    const organization = await prisma.organizationElement.findUnique({
      where: { id: organizationId },
      include: {
        dataEntries: true,
        profiles: true,
      },
    });

    if (!organization) return false;

    // Only allow deletion if organization has no associated data
    return organization.dataEntries.length === 0 && organization.profiles.length === 0;
  }

  /**
   * Checks if user can view a specific organization
   * @param profile - Authenticated user profile
   * @param organizationId - ID of organization to view
   * @returns boolean - true if user has any data role and has access to the organization
   */
  async canView(profile: ProfileWithRoles, organizationId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !(await hasRole(profile, 'ADMIN'))) {
      return false;
    }

    const organization = await prisma.organizationElement.findUnique({
      where: { id: organizationId },
    });

    if (!organization) return false;

    // Allow view if user is admin or is associated with this organization
    return (
      (await hasRole(profile, 'ADMIN')) ||
      profile.organizationElementCode === organization.code
    );
  }

  /**
   * Checks if user can view all organizations
   * @param profile - Authenticated user profile
   * @returns boolean - true if user has any data role
   */
  async canViewAll(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !(await hasRole(profile, 'ADMIN'))) {
      return false;
    }

    return true;
  }
}
