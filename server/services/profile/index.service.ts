import prisma  from "@/server/utils/prisma"
import type { ErrorWithStatus, ProfileWithRoles } from '@/types';
import { z } from "zod";
import { CreateProfileSchema, ProfileUserIdSchema, ProfileWithRolesSchema } from "~/server/schemas/profile.schema";

interface ProfileService {
   getProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   getAllProfiles () :Promise<{ data: ProfileWithRoles[] | null; error: Error | null }>
   createProfile (input: z.infer<typeof ProfileWithRolesSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   updateProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>,input: z.infer<typeof CreateProfileSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
   deleteProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) :Promise<{ data: ProfileWithRoles | null; error: ErrorWithStatus | null }>
}

export class ProfileServices implements ProfileService  {
  /**
   * Fetches all profiles
   * @returns
   */
  async getAllProfiles(): Promise<{ data: ProfileWithRoles[] | null; error: Error | null; }> {
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
  async getProfileByUserId (userId: z.infer<typeof ProfileUserIdSchema>) : Promise<{ data: ProfileWithRoles | null; error: Error | null }> {
    let error: Error | null = null

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { roles:  true}
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
}


