import { ProfileServices } from '~/server/services/profile/index.service';
import { ProfileWithRoles } from '~/types';
import prisma from '@/server/utils/prisma';
import type { DataEntry } from '@prisma/client';

interface IPermissions {
  // Data category permissions
  canCreate(profile: ProfileWithRoles): Promise<boolean>;
  canUpdate(profile: ProfileWithRoles, categoryId: number): Promise<boolean>;
  canDelete(profile: ProfileWithRoles, categoryId: number): Promise<boolean>;
  canView(profile: ProfileWithRoles, categoryId: number): Promise<boolean>;
  canViewAll(profile: ProfileWithRoles, categoryId: number): Promise<boolean>;
}

/**
 * Permissions Class for granular access control
 */
export class CategoriesPermissions implements IPermissions {
  /////////////////////////////////////////////////
  // Data Category permissions
  /////////////////////////////////////////////////

  /**
   * Checks if user can create data categories
   * @param user - Authenticated user
   * @returns boolean - true if user has DATA_ADMIN role or is organization data manager
   */
  async canCreate(profile: ProfileWithRoles): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    return (await hasRole(profile, 'ADMIN')) || ((await hasRole(profile, 'CREATOR')) && !!profile.organizationElementCode);
  }

  /**
   * Checks if user can update a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to update
   * @returns boolean - true if user has DATA_ADMIN role or owns the category
   */
  async canUpdate(profile: ProfileWithRoles, categoryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (await hasRole(profile, 'ADMIN')) return true;

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true },
    });

    if (!category) return false;

    // Check if user's org has entries in this category
    return category.dataEntries.some(entry => entry.organizationElementCode === profile.organizationElementCode);
  }

  /**
   * Checks if user can delete a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to delete
   * @returns boolean - true if user has DATA_ADMIN role and category is empty
   */
  async canDelete(profile: ProfileWithRoles, categoryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();
    if (!(await hasRole(profile, 'ADMIN'))) return false;

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: {
        dataEntries: true,
        indicators: true,
        variables: true,
      },
    });

    if (!category) return false;

    // Only allow deletion if category has no associated data
    return category.dataEntries.length === 0 && category.indicators.length === 0 && category.variables.length === 0;
  }

  /**
   * Checks if user can view a specific data category
   * @param user - Authenticated user
   * @param categoryId - ID of category to view
   * @returns boolean - true if user has any data role and org access
   */
  async canView(profile: ProfileWithRoles, categoryId: number): Promise<boolean> {
    const { hasRole } = new ProfileServices();

    if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !hasRole(profile, 'ADMIN')) {
      return false;
    }

    const category = await prisma.dataCategory.findUnique({
      where: { id: categoryId },
      include: { dataEntries: true },
    });

    if (!category) return false;

    // Allow view if user is admin or has org access
    return (
      (await hasRole(profile, 'ADMIN')) ||
      category.dataEntries.some((entry: DataEntry) => entry.organizationElementCode === profile.organizationElementCode)
    );
  }

    /**
   * Checks if user can view a all data category
   * @param user - Authenticated user
   * @returns boolean - true if user has any data role and org access
   */
    async canViewAll(profile: ProfileWithRoles): Promise<boolean> {
      const { hasRole } = new ProfileServices();

      if (!(await hasRole(profile, 'VIEWER')) && !(await hasRole(profile, 'CREATOR')) && !(await hasRole(profile, 'ADMIN'))) {
        return false;
      }

      return true

    }
}
