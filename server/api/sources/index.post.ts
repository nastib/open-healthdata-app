import { defineEventHandler, createError, readBody } from 'h3'
import { DataSourceServices } from '~/server/services/sources/index.service'
import { DataSourcePermissions } from '~/server/utils/permissions/sources.permissions'
import { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { z } from 'zod'
import { DataSourceSchema } from '~/server/schemas/sources.schema'

const dataSourceServices = new DataSourceServices()
const dataSourcePermissions = new DataSourcePermissions()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await dataSourcePermissions.canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create data sources'
      })
    }

    const body = await readBody(event)
    const validatedData = DataSourceSchema.safeParse(body)
    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Data Source Data',
        data: validatedData.error?.format()
      })
    }

    const { data, error } = await dataSourceServices.createSource(validatedData.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 400,
        statusMessage: serviceError?.statusMessage || 'Failed to create data source',
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
