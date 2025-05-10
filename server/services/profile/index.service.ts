import prisma  from "@/server/utils/prisma"
import type { ProfileWithRoles } from '@/types';

export const ProfileServices = {

  /**
   * Fetches a profile by userId
   * @param userId
   * @returns
   */
  getProfileById: async (userId: string) => {
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


