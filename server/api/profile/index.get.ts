import { ProfileServices } from '@/server/services/profile/index.service'
import { ErrorWithStatus } from '@/types'
import { ProfilePermissions } from '@/server/utils'

export default defineEventHandler(async (event) => {
  const { fetchAllProfiles } = new ProfileServices()
  const { getAuthenticatedUserFromJWT } = new AuthServer()
  const profilePermissions  = new ProfilePermissions()

  try {

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await profilePermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this data entry'
      })
    }

    const { data, error } = await fetchAllProfiles()

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
