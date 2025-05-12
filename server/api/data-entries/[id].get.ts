import { defineEventHandler } from 'h3'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import { DataEntryIdSchema } from '~/server/schemas/data-entries.schema'
import type { ErrorWithStatus } from '~/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { getDataEntryById } = new DataEntryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUser, getPermissions } = authServer

  try {
    const entryIdString = event.context.params?.id
    const entryId = Number(entryIdString)

    // Validate input ID
    const validationId = DataEntryIdSchema.safeParse(entryId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Entry ID',
        data: validationId.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUser(event)
    if (!await getPermissions().canViewDataEntry(user, validationId.data)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this data entry'
      })
    }

    // Fetch data entry
    const { data, error } = await getDataEntryById(validationId.data)

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
