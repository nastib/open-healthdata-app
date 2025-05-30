import { defineEventHandler, createError, getRouterParam, readBody } from 'h3'
import { VariableServices } from '~/server/services/variables/index.service'
import { VariableIdSchema, UpdateVariableSchema } from '~/server/schemas/variables.schema'
import { ErrorWithStatus } from '~/types'
import { VariablesPermissions } from '~/server/utils/permissions/variables.permissions'
import { AuthServer } from '~/server/utils/auth.server'

const variablePermissions = new VariablesPermissions()
const variableServices = new VariableServices()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const variableId = Number(getRouterParam(event, 'id'))
    const validationId = VariableIdSchema.safeParse(variableId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Variable ID',
        data: validationId.error?.format()
      })
    }

    const user = await getAuthenticatedUserFromJWT(event)
    if (!await variablePermissions.canUpdate(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this variable'
      })
    }

    const body = await readBody(event)
    const validatedData = UpdateVariableSchema.safeParse(body)
    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Variable Data',
        data: validatedData.error?.format()
      })
    }

    const data = await variableServices.updateVariable(validationId.data, validatedData.data)
    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: `Variable with ID ${validationId.data} not found`
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
