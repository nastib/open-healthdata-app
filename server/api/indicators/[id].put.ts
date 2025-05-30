import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { IndicatorServices } from '~/server/services/indicators/index.service'
import { IndicatorPermissions } from '~/server/utils/permissions/indicators.permissions'
import { UpdateIndicatorSchema, IndicatorIdSchema } from '~/server/schemas/indicators.schema'
import { ErrorWithStatus } from '~/types'

const indicatorServices = new IndicatorServices()
const indicatorPermissions = new IndicatorPermissions()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const indicatorId = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)

    // Validate input ID
    const validationId = IndicatorIdSchema.safeParse(indicatorId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Indicator ID',
        data: validationId.error?.format()
      })
    }

    // Validate request body
    const validatedData = UpdateIndicatorSchema.safeParse(body)
    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Indicator Data',
        data: validatedData.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await indicatorPermissions.canUpdate(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this indicator'
      })
    }

    const { data, error } = await indicatorServices.updateIndicator(
      validationId.data,
      validatedData.data
    )

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Failed to update indicator with ID ${validationId.data}`,
        data: serviceError
      })
    }

    return {
      success: true,
      data: data,
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
