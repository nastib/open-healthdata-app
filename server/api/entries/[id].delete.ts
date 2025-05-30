import { defineEventHandler } from 'h3'
import { EntryIdSchema } from '@/server/schemas/entries.schema'
import { EntryServices } from '@/server/services/entries/index.service'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

const { deleteEntry } = new EntryServices()
const entriesPermissions = new EntriesPermissions()


export default defineEventHandler(async (event) => {
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer

   try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const entryId = Number(event.context.params?.id)
    if (!await entriesPermissions.canDelete(user.profile, entryId)) {
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
    const validationId = EntryIdSchema.safeParse(id)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      }) as ErrorWithStatus
    }
    // Delete data entry
    const { data, error } = await deleteEntry(validationId.data)

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
