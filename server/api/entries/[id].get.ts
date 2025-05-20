import { defineEventHandler } from 'h3'
import { EntryServices } from '~/server/services/entries/index.service'
import { EntryIdSchema } from '~/server/schemas/entries.schema'
import type { ErrorWithStatus } from '~/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { fetchEntryById } = new EntryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const entriesPermissions = new EntriesPermissions()


  try {
    const entryIdString = event.context.params?.id
    const entryId = Number(entryIdString)

    // Validate input ID
    const validationId = EntryIdSchema.safeParse(entryId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Entry ID',
        data: validationId.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await entriesPermissions.canView(user.profile, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this data entry'
      })
    }

    // Fetch data entry
    const { data, error } = await fetchEntryById(validationId.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Data entry with ID ${validationId.data} not found. ${serviceError?.message || ''}`,
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
