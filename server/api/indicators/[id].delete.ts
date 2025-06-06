import { defineEventHandler, createError, getRouterParam } from 'h3'
import { IndicatorServices } from '~/server/services/indicators/index.service'
import { IndicatorIdSchema } from '~/server/schemas/indicators.schema'
import { ErrorWithStatus } from '~/types'
import { IndicatorPermissions } from '~/server/utils/permissions/indicators.permissions'

const indicatorServices = new IndicatorServices()
const indicatorPermissions = new IndicatorPermissions()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()
  try {
    const indicatorId = Number(getRouterParam(event, 'id'))
    // Validate input ID
    const validationId = IndicatorIdSchema.safeParse(indicatorId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Indicator ID',
        data: validationId.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await indicatorPermissions.canDelete(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this data category'
      })
    }

    const { data, error } = await indicatorServices.deleteIndicator(validationId.data)
    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Indicator with ID ${validationId.data} not found. ${serviceError?.message || ''}`,
        data: serviceError
      })
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    // Log the error for debugging, potentially redacting sensitive info
    // console.error("Error in [id].delete.ts for data-categories:", redactSensitive(err))
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data,
    })
  }
})
