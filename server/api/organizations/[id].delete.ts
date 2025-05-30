import { defineEventHandler, createError, H3Event } from 'h3';
import { OrganizationIdSchema } from '~/server/schemas/organizations.schemas'
import { OrganizationServices } from '~/server/services/organizations/index.service'
import type { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server'
import { OrganizationsPermissions } from '~/server/utils/permissions/organizations.permissions'

export default defineEventHandler(async (event: H3Event) => {
  const { deleteOrganization } = new OrganizationServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const organizationsPermissions = new OrganizationsPermissions()

  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const organizationId = Number(event.context.params?.id)
    if (!await organizationsPermissions.canDelete(user.profile, organizationId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this organization'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id)
    const validationId = OrganizationIdSchema.safeParse(id);

    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      });
    }

    // Delete organization
    const { data, error } = await deleteOrganization(validationId.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error,
      });
    }

    return {
      success: true,
      message: 'Organization deleted successfully'
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error'
    })
  }
})
