import { defineEventHandler, createError, getQuery } from 'h3'
import { VariableServices } from '~/server/services/variables/index.service'
import { VariableQuerySchema } from '~/server/schemas/variables.schema'
import { ErrorWithStatus } from '~/types'
import { VariablesPermissions } from '~/server/utils/permissions/variables.permissions'
import { AuthServer } from '~/server/utils/auth.server'

const variablePermissions = new VariablesPermissions()
const variablesServices = new VariableServices()

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

    const validatedQuery = VariableQuerySchema.safeParse(query)
    console.log(validatedQuery);

    if (!validatedQuery.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Query Parameters',
        data: validatedQuery.error.format()
      })
    }

    const user = await getAuthenticatedUserFromJWT(event)
    if (!await variablePermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view variables'
      })
    }

    const data = await variablesServices.fetchVariables(validatedQuery.data)
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
