import { defineEventHandler, getQuery, createError } from 'h3'
import { IndicatorServices } from '~/server/services/indicators/index.service'
import { IndicatorPermissions } from '~/server/utils/permissions/indicators.permissions'
import { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { IndicatorQuerySchema } from '~/server/schemas/indicators.schema'
import { z } from 'zod'

const indicatorServices = new IndicatorServices()
const indicatorPermissions = new IndicatorPermissions()

const MAX_LIMIT = 100
const CACHE_TTL = 60 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    // Validate query params
    const rawQuery = getQuery(event)
    const query = {
      ...rawQuery,
      limit: rawQuery.limit ? Math.min(Number(rawQuery.limit), MAX_LIMIT) : MAX_LIMIT,
      offset: rawQuery.offset ? Number(rawQuery.offset) : 0,
      sort: rawQuery.sort || 'asc'
    }

    // Validate and transform query parameters
    const validatedQuery = IndicatorQuerySchema.safeParse(query)
    if (!validatedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Query Parameters',
        data: validatedQuery.error.format()
      })
    }

    // Check authentication and permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await indicatorPermissions.canView(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view indicators'
      })
    }


    const { data, error } = await indicatorServices.fetchIndicators(validatedQuery.data )

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 500,
        statusMessage: serviceError?.statusMessage || 'Failed to fetch indicators',
        data: serviceError
      })
    }

    return {
      success: true,
      data: data
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data,
    })
  }
})
