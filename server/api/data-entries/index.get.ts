import { defineEventHandler, getQuery } from 'h3'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import { DataEntryQuerySchema } from '~/server/schemas/data-entries.schema'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { getDataEntries } = new DataEntryServices()
  const { getAuthenticatedUser } = new AuthServer()

  try {
    // Check user role
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_VIEWER')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions',
        data: user.profile.roles.map((role) => role.code).join(', ')
      }) as ErrorWithStatus
    }

    const query = getQuery(event)
    // Validate query params
    const validation = DataEntryQuerySchema.safeParse(query)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      }) as ErrorWithStatus
    }

    // Get data entries
    const { data, error } = await getDataEntries(validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
    }

    return {
      success: true,
      data: data,
      meta: {
        count: data?.length || 0
      }
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data
    }) as ErrorWithStatus
  }
})
