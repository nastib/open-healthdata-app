import { defineEventHandler, readBody } from 'h3'
import { EntryServices } from '@/server/services/entries/index.service'
import { CreateEntrySchema } from '@/server/schemas/entries.schema'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '@/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { createEntry } = new EntryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const entriesPermissions = new EntriesPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await entriesPermissions.canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create data entries',
        data: {
          requiredRoles: ['DATA_ADMIN', 'DATA_CREATOR'],
          userRoles: user.profile.roles.map((role) => role.code)
        }
      }) as ErrorWithStatus
    }

    const body = await readBody(event)
    // Validate input
    const validation = CreateEntrySchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      }) as ErrorWithStatus
    }

    // Create data entry
    const { data, error } = await createEntry(validation.data)

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
    }) as ErrorWithStatus
  }
})
