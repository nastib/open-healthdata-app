import { defineEventHandler, readBody } from 'h3'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import { DataEntryIdSchema, UpdateDataEntrySchema } from '~/server/schemas/data-entries.schema'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  const { updateDataEntry } = new DataEntryServices()

  try {
    // Check user role
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_EDITOR')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions',
        data: user.profile.roles.map((role) => role.code).join(', ')
      }) as ErrorWithStatus
    }

    const id = Number(event.context.params?.id)
    const body = await readBody(event)

    // Validate input
    const validation = UpdateDataEntrySchema.safeParse(body)
    const validationId = DataEntryIdSchema.safeParse(id)

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
    const { data, error } = await updateDataEntry(validationId.data, validation.data)

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
