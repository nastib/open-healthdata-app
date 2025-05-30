import { defineEventHandler, createError, getRouterParam } from 'h3'
import { DataSourceServices } from '~/server/services/sources/index.service'
import { DataSourcePermissions } from '~/server/utils/permissions/sources.permissions'
import { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { z } from 'zod'

const dataSourceServices = new DataSourceServices()
const dataSourcePermissions = new DataSourcePermissions()

const IdSchema = z.number().int().positive()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const id = Number(getRouterParam(event, 'id'))
    const validationId = IdSchema.safeParse(id)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Data Source ID',
        data: validationId.error?.format()
      })
    }

    const user = await getAuthenticatedUserFromJWT(event)
    if (!await dataSourcePermissions.canDelete(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this data source'
      })
    }

    const { data, error } = await dataSourceServices.deleteSource(validationId.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Failed to delete data source with ID ${validationId.data}`,
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
