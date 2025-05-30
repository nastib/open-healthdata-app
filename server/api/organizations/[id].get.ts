import { defineEventHandler, createError } from 'h3'
import { OrganizationServices } from '~/server/services/organizations/index.service'
import { OrganizationIdSchema } from '~/server/schemas/organizations.schemas'
import type { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { OrganizationsPermissions } from '~/server/utils/permissions/organizations.permissions'

export default defineEventHandler(async (event) => {
  const { fetchOrganizationById } = new OrganizationServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const organizationsPermissions = new OrganizationsPermissions()

  try {
    const organizationIdString = event.context.params?.id
    const organizationId = Number(organizationIdString)

    // Validate input ID
    const validationId = OrganizationIdSchema.safeParse(organizationId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Organization ID',
        data: validationId.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await organizationsPermissions.canView(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this organization'
      })
    }

    // Fetch organization
    const { data, error } = await fetchOrganizationById(validationId.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Organization with ID ${validationId.data} not found. ${serviceError?.message || ''}`,
        data: serviceError
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
