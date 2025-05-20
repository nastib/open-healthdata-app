import prisma  from "@/server/utils/prisma"
import type { ErrorWithStatus, Profile, ProfileWithRoles, Role } from '@/types';
import { z } from "zod";
import { CreateProfileSchema, ProfileUserIdSchema, ProfileWithRolesSchema } from "~/server/schemas/profile.schema";

interface ProfileService {
   fetchProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   fetchAllProfiles () :Promise<{ data: ProfileWithRoles[] | null; error: Error | null }>
   createProfile (input: z.infer<typeof ProfileWithRolesSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   updateProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>,input: z.infer<typeof CreateProfileSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   deleteProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   hasRole (profile: ProfileWithRoles, roleCode: string) :Promise<boolean>
   hasAnyRole (profile: ProfileWithRoles, roleCodes: string[]) :Promise<boolean>
   hasAllRoles (profile: ProfileWithRoles, requiredRoleCodes: string[]) :Promise<boolean>
}

export class ProfileServices implements ProfileService  {
  /**
   * Fetches all profiles
   * @returns
   */
  async fetchAllProfiles(): Promise<{ data: ProfileWithRoles[] | null; error: Error | null; }> {
    let error: Error | null = null;

    try {
      const profiles = await prisma.profile.findMany({
        include: { roles: true }
      }) as ProfileWithRoles[];

      return {
        data: profiles || null,
        error
      };
    } catch (err) {
      error = err as Error;
      return {
        data: null,
        error
      };
    }
  }

  /**
   * Creates a new profile
   * @param input
   * @returns
   */
  async createProfile(input: z.infer<typeof ProfileWithRolesSchema>): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null; }> {
    let error: ErrorWithStatus | null = null;

    try {
      const profile = await prisma.profile.create({
        data: {
          firstName: input.firstName || 'John',
          lastName: input.lastName || 'DOE',
          userId: input.userId,
          roles: {
            connect: [{code : 'USER' }]
          }
        },
        include: { roles: true }
      }) as ProfileWithRoles;

      return {
        data: profile || null,
        error
      };
    } catch (err) {
      error = createError({ statusCode: 400, message: (err as Error).message }) as ErrorWithStatus;
      return {
        data: null,
        error
      };
    }
  }

  updateProfileByUserId(userId: z.infer<typeof ProfileUserIdSchema>, input: z.infer<typeof CreateProfileSchema>): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null; }> {
    throw new Error("Method not implemented.");
  }

  deleteProfileByUserId(userId: z.infer<typeof ProfileUserIdSchema>): Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null; }> {
    throw new Error("Method not implemented.");
  }

  /**
   * Fetches a profile by userId
   * @param userId
   * @returns
   */
  async fetchProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) : Promise<{ data: ProfileWithRoles | null; error: Error | null }> {
    let error: Error | null = null

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { roles:  true }
    }) as ProfileWithRoles

    if (!profile) {
      error = createError( {statusCode: 404, message: 'Profile not found'})
      console.log({
        statusCode: 404,
        statusMessage: 'Profile not found'
      })
    }

    return {
      data:  profile || null,
      error
    }
  }

  /**
   * Check if profile has a role
   * @param userID
   * @param roleCode
   * @returns
   */
  async hasRole (profile: ProfileWithRoles, roleCode: string) {
    //const { data: profile, error } = await this.fetchProfileByUserId(userID)
    if (!profile?.roles) return false
    return (profile as ProfileWithRoles).roles.some((role: Role) => role.code === roleCode)
  }

  /**
   * Check if profile has any roles
   * @param userId
   * @param roleCodes
   * @returns
   */
  async hasAnyRole (profile: ProfileWithRoles, roleCodes: string[]) {
    return roleCodes.some(roleCode =>
      (profile as ProfileWithRoles)?.roles.some((role: Role) => role.code === roleCode)
    )
  }

  /**
   * Check if profile has all roles
   * @param userID
   * @param requiredRoleCodes
   * @returns
   */
  async hasAllRoles (profile: ProfileWithRoles, requiredRoleCodes: string[]) {
    if (!(profile as ProfileWithRoles)?.roles) return false
    return requiredRoleCodes.every(requiredCode =>
      (profile as ProfileWithRoles)?.roles?.some(role => role.code === requiredCode)
    )
  }
}


