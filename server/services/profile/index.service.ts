import prisma from '@/server/utils/prisma';
import type { ErrorWithStatus } from '@/types';
import { z } from 'zod';
import {
  CreateProfileSchema,
  ProfileUserIdSchema,
  ProfileWithRolesSchema,
  ProfileWithRoles,
  ProfileQuerySchema,
} from '~/server/schemas/profile.schema';

interface ProfileService {
  fetchProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>;
  fetchAllProfiles(query: z.infer<typeof ProfileQuerySchema>): Promise<{ data: ProfileWithRoles[] | null; error: ErrorWithStatus | null }>;
  createProfile(payload: z.infer<typeof ProfileWithRolesSchema>): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>;
  updateProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
    payload: z.infer<typeof CreateProfileSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>;
  deleteProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>;

  hasRole(profile: ProfileWithRoles, roleCode: string): Promise<boolean>;
  hasAnyRole(profile: ProfileWithRoles, roleCodes: string[]): Promise<boolean>;
  hasAllRoles(profile: ProfileWithRoles, requiredRoleCodes: string[]): Promise<boolean>;
}

export class ProfileServices implements ProfileService {
  /**
   * Fetches all profiles
   * @returns
   */
  async fetchAllProfiles(
    query: z.infer<typeof ProfileQuerySchema>,
  ): Promise<{ data: ProfileWithRoles[] | null; error: ErrorWithStatus | null }> {
    let error: Error | null = null;

    try {
      const data = (await prisma.profile.findMany({
        include: { roles: true },
      })) as unknown as ProfileWithRoles[];

      if (!data) {
        return {
          data: null,
          error: {
            name: 'ProfileNotFoundError',
            statusCode: 404,
            statusMessage: 'Profile not found',
            message: `No Profile found`,
          },
        };
      }

      return {
        data,
        error,
      };
    } catch (error) {
      const err = error as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'ProfileServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch profile',
          message: err.message,
        },
      };
    }
  }

  /**
   * Creates a new profile
   * @param input
   * @returns
   */
  async createProfile(
    input: z.infer<typeof ProfileWithRolesSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }> {
    let error: ErrorWithStatus | null = null;

    try {
      const data = (await prisma.profile.create({
        data: {
          firstName: input.firstName || 'John',
          lastName: input.lastName || 'DOE',
          userId: input.userId,
          roles: {
            connect: [{ code: 'USER' }],
          },
        },
        include: { roles: true },
      })) as unknown as ProfileWithRoles;

      if (!data) {
        return {
          data: null,
          error: {
            name: 'ProfileCreationError',
            statusCode: 404,
            statusMessage: 'Failed to create profile',
            message: `Failed to create profile`,
          },
        };
      }

      return {
        data: data || null,
        error,
      };
    } catch (err) {
      error = createError({ statusCode: 400, message: (err as Error).message }) as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'ProfileServiceError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to fetch profile',
          message: error.message,
        },
      };
    }
  }

  /**
   * update profile
   * @param userId
   * @param input
   * @returns
   */
  async updateProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
    input: z.infer<typeof CreateProfileSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }> {
    try {
      const data = (await prisma.profile.update({
        where: { userId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
        include: { roles: true },
      })) as unknown as ProfileWithRoles;

      if (!data) {
        return {
          data: null,
          error: {
            name: 'ProfileUpdateError',
            statusCode: 404,
            statusMessage: 'Failed to update profile',
            message: `Failed to update profile for userId ${userId}`,
          },
        };
      }

      return {
        data,
        error: null,
      };
    } catch (err) {
      const error = err as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'ProfileServiceError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to update profile',
          message: error.message,
        },
      };
    }
  }

  /**
   * Delete a profile by userId
   * @param userId
   * @returns
   */
  async deleteProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }> {
    try {
      // First fetch the profile to return after deletion
      const profile = await this.fetchProfileByUserId(userId);
      if (profile.error || !profile.data) {
        return {
          data: null,
          error: profile.error || {
            name: 'ProfileNotFoundError',
            statusCode: 404,
            statusMessage: 'Profile not found',
            message: `Profile with userId ${userId} not found`
          }
        };
      }

      // Delete the profile
      await prisma.profile.delete({
        where: { userId }
      });

      return {
        data: profile.data,
        error: null
      };
    } catch (err) {
      const error = err as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'ProfileDeletionError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to delete profile',
          message: error.message
        }
      };
    }
  }

  /**
   * Fetches a profile by userId
   * @param userId
   * @returns
   */
  async fetchProfileByUserId(
    userId: z.infer<typeof ProfileUserIdSchema>,
  ): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }> {
    let error: ErrorWithStatus | null = null;

    try {
      const data = (await prisma.profile.findUnique({
        where: { userId },
        include: { roles: true },
      })) as unknown as ProfileWithRoles ;

      if (!data) {
        return {
          data: null,
          error: {
            name: 'ProfileNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to found profile',
            message: `Failed to found profile`,
          },
        };
      }
      return {
        data: data || null,
        error,
      };
    } catch (err) {
      error = createError({ statusCode: 400, message: (err as Error).message }) as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'ProfileServiceError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to fetch profile',
          message: error.message,
        },
      };
    }
  }

  /**
   * Check if profile has a role
   * @param userID
   * @param roleCode
   * @returns
   */
  async hasRole(profile: ProfileWithRoles, roleCode: string): Promise<boolean> {
    if (!profile?.roles) return false;
    return profile.roles.some(role => role.code === roleCode);
  }

  /**
   * Check if profile has any roles
   * @param userId
   * @param roleCodes
   * @returns
   */
  async hasAnyRole(profile: ProfileWithRoles, roleCodes: string[]) {
    return roleCodes.some(roleCode => profile?.roles.some((role) => role.code === roleCode));
  }

  /**
   * Check if profile has all roles
   * @param userID
   * @param requiredRoleCodes
   * @returns
   */
  async hasAllRoles(profile: ProfileWithRoles, requiredRoleCodes: string[]) {
    if (!(profile as ProfileWithRoles)?.roles) return false;
    return requiredRoleCodes.every(requiredCode => (profile as ProfileWithRoles)?.roles?.some(role => role.code === requiredCode));
  }
}
