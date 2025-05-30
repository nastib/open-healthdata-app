import { defineEventHandler, readBody, createError } from 'h3'
import { OrganizationServices } from '~/server/services/organizations/index.service'
import { CreateOrganizationSchema } from '~/server/schemas/organizations.schemas'
import type { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { OrganizationsPermissions } from '~/server/utils/permissions/organizations.permissions'

export default defineEventHandler(async (event) => {
  const { createOrganization } = new OrganizationServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const organizationsPermissions = new OrganizationsPermissions()

  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await organizationsPermissions.canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create organizations'
      })
    }

    // Validate input
    const body = await readBody(event)
    const validation = CreateOrganizationSchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    const { data, error } = await createOrganization(validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      })
    }

    return {
      success: true,
      data: data
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data
    })
  }
})
