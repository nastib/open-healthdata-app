import { defineEventHandler, readBody, createError } from 'h3'
import { IndicatorServices } from '~/server/services/indicators/index.service'
import { IndicatorPermissions } from '~/server/utils/permissions/indicators.permissions'
import { CreateIndicatorSchema } from '~/server/schemas/indicators.schema'
import { ErrorWithStatus } from '~/types'

const indicatorServices = new IndicatorServices()
const indicatorPermissions = new IndicatorPermissions()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const body = await readBody(event)

    // Validate request body
    const validatedData = CreateIndicatorSchema.safeParse(body)
    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Indicator Data',
        data: validatedData.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await indicatorPermissions.canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create indicators'
      })
    }

    const { data, error } = await indicatorServices.createIndicator(
      validatedData.data
    )

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 500,
        statusMessage: serviceError?.statusMessage || 'Failed to create indicator',
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
