import { defineEventHandler, createError, getRouterParam } from 'h3'
import {  VariableServices } from '~/server/services/variables/index.service'
import { VariableIdSchema } from '~/server/schemas/variables.schema'
import { ErrorWithStatus } from '~/types'
import { VariablesPermissions } from '~/server/utils/permissions/variables.permissions'
import { AuthServer } from '~/server/utils/auth.server'

const variablePermissions = new VariablesPermissions()
const { fetchVariableById } = new VariableServices()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const variableId = getRouterParam(event, 'id')
    const validationId = VariableIdSchema.safeParse(Number(variableId))
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Variable ID',
        data: validationId.error?.format()
      })
    }

    const user = await getAuthenticatedUserFromJWT(event)
    if (!await variablePermissions.canView(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this variable'
      })
    }

    const data = await fetchVariableById(validationId.data)
    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: `Variable with ID ${variableId} not found`
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
