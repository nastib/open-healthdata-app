import { defineEventHandler } from 'h3'
import { DataEntryIdSchema } from '~/server/schemas/data-entries.schema'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  const { deleteDataEntry } = new DataEntryServices()

   try {
    // Check user role
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_DELETE')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions',
        data: user.profile.roles.map((role) => role.code).join(', ')
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
