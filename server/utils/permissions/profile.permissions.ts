import { ProfileServices } from '~/server/services/profile/index.service';
import type { ProfileWithRoles } from '~/server/schemas/profile.schema'
import prisma from '@/server/utils/prisma';

interface IPermissions {
  // Profile permissions
  canCreate(profile: ProfileWithRoles): Promise<boolean>;
  canUpdate(profile: ProfileWithRoles, profileUserId: string): Promise<boolean>;
  canDelete(profile: ProfileWithRoles, profileUserId: string): Promise<boolean>;
  canView(profile: ProfileWithRoles, profileUserId: string): Promise<boolean>;
  canViewAll(profile: ProfileWithRoles): Promise<boolean>;
}

/**
 * Permissions Class for granular profile access control
 */
export class ProfilePermissions implements IPermissions {
  /////////////////////////////////////////////////
  // Profile permissions
  /////////////////////////////////////////////////

  /**
   * Checks if user can create profiles
   * @param profile - Authenticated user profile
   * @returns boolean - true if user has USER_ADMIN role
   */
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    return await hasRole(profile, 'ADMIN');
  }

  /**
   * Checks if user can update a specific profile
   * @param profile - Authenticated user profile
   * @param profileUserId - ID of profile to update
   * @returns boolean - true if user has USER_ADMIN role or is updating their own profile
   */
  async canUpdate(profile: ProfileWithRoles, profileUserId: string): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (await hasRole(profile, 'ADMIN')) return true;
    return profile.userId === profileUserId;
  }

  /**
   * Checks if user can delete a specific profile
   * @param profile - Authenticated user profile
   * @param profileUserId - ID of profile to delete
   * @returns boolean - true if user has USER_ADMIN role and is not deleting themselves
   */
  async canDelete(profile: ProfileWithRoles, profileUserId: string): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (!(await hasRole(profile, 'ADMIN'))) return false;
    return profile.userId !== profileUserId;
  }

  /**
   * Checks if user can view a specific profile
   * @param profile - Authenticated user profile
   * @param profileUserId - ID of profile to view
   * @returns boolean - true if user has USER_ADMIN role or is viewing their own profile
   */
  async canView(profile: ProfileWithRoles, profileUserId: string): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (await hasRole(profile, 'ADMIN')) return true;
    return profile.userId === profileUserId;
  }

  /**
   * Checks if user can view all profiles
   * @param profile - Authenticated user profile
   * @returns boolean - true if user has USER_ADMIN role
   */
  async canViewAll(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    return await hasRole(profile, 'ADMIN');
  }
}

