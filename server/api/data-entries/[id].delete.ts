import { defineEventHandler } from 'h3'
import { DataEntryIdSchema } from '~/server/schemas/data-entries.schema'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { deleteDataEntry } = new DataEntryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUser, getPermissions } = authServer

   try {
    // Check user permissions
    const user = await getAuthenticatedUser(event)
    const entryId = Number(event.context.params?.id)
    if (!await getPermissions().canDeleteDataEntry(user, entryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this data entry',
        data: {
          requiredRoles: ['DATA_ADMIN'],
          userRoles: user.profile.roles.map((role) => role.code),
          organizationElementCode: user.profile.organizationElementCode
        }
      }) as ErrorWithStatus
    }

    // Validate input
    const id = Number(event.context.params?.id)
    const validationId = DataEntryIdSchema.safeParse(id)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      }) as ErrorWithStatus
    }
    // Delete data entry
    const { data, error } = await deleteDataEntry(validationId.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
    }

    return {
      success: true,
      message: 'Data entry deleted successfully'
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error'
    })
  }
})
