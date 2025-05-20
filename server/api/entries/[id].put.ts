import { defineEventHandler, readBody } from 'h3'
import { EntryServices } from '~/server/services/entries/index.service'
import { EntryIdSchema, UpdateEntrySchema } from '~/server/schemas/entries.schema'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { updateEntry } = new EntryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const entriesPermissions = new EntriesPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const entryId = Number(event.context.params?.id)
    if (!await entriesPermissions.canUpdate(user.profile, entryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this data entry',
        data: {
          requiredRoles: ['DATA_ADMIN'],
          userRoles: user.profile.roles.map((role) => role.code),
          organizationElementCode: user.profile.organizationElementCode
        }
      }) as ErrorWithStatus
    }

    const id = Number(event.context.params?.id)
    const body = await readBody(event)

    // Validate input
    const validation = UpdateEntrySchema.safeParse(body)
    const validationId = EntryIdSchema.safeParse(id)

    if (!validation.success || !validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: {
          ...validation.error?.format(),
          ...validationId.error?.format()
        }
      }) as ErrorWithStatus
    }
    // Update data entry
    const { data, error } = await updateEntry(validationId.data, validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
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
