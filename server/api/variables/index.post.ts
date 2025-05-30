import { defineEventHandler, createError, readBody } from 'h3'
import { VariableServices } from '~/server/services/variables/index.service'
import { CreateVariableSchema } from '~/server/schemas/variables.schema'
import { ErrorWithStatus } from '~/types'
import { VariablesPermissions } from '~/server/utils/permissions/variables.permissions'
import { AuthServer } from '~/server/utils/auth.server'

const { createVariable } = new VariableServices()
const { canCreate} = new VariablesPermissions()

export default defineEventHandler(async (event) => {
  const { getAuthenticatedUserFromJWT } = new AuthServer()

  try {
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create variables'
      })
    }

    const body = await readBody(event)
    const validatedData = CreateVariableSchema.safeParse(body)
    if (!validatedData.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Variable Data',
        data: validatedData.error?.format()
      })
    }

    const data = await createVariable(validatedData.data)
    if (!data) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create variable'
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
