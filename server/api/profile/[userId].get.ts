import { ProfileServices } from '~/server/services/profile/index.service'
import { ProfileUserIdSchema } from '~/server/schemas/profile.schema'
import { ErrorWithStatus } from '~/types'
import prisma from '@/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const profileServices = new ProfileServices()

  try {

    // Validate input
    const userId = event.context.params?.userId
    const validationUserId = ProfileUserIdSchema.safeParse(userId)

    if (!validationUserId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationUserId.error.format()
      }) as ErrorWithStatus
    }

    const { data, error } = await profileServices.getProfileByUserId(validationUserId.data )

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
    }

    return { data, error }

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profile'
    })
  }
})
