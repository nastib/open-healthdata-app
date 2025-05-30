import { defineEventHandler, createError } from 'h3'
import { DataSourceServices } from '~/server/services/sources/index.service'
import { DataSourcePermissions } from '~/server/utils/permissions/sources.permissions'
import { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { SourceQuerySchema } from '~/server/schemas/sources.schema'
import { getQuery } from 'h3'
import { z } from 'zod'

const dataSourceServices = new DataSourceServices()
const dataSourcePermissions = new DataSourcePermissions()

const MAX_LIMIT = 100
const CACHE_TTL = 60 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await dataSourcePermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to list data sources'
      })
    }

    // Validate query params
    const rawQuery = getQuery(event)
    const query = {
      ...rawQuery,
      limit: rawQuery.limit ? Math.min(Number(rawQuery.limit), MAX_LIMIT) : MAX_LIMIT,
      offset: rawQuery.offset ? Number(rawQuery.offset) : 0,
      sort: rawQuery.sort || 'asc'
    }
    const validatedQuery = SourceQuerySchema.safeParse(query)
    if (!validatedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Query Parameters',
        data: validatedQuery.error?.format()
      })
    }

    const { data, error } = await dataSourceServices.fetchSources(validatedQuery.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || 'Failed to fetch data sources',
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
