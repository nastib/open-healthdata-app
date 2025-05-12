import { defineEventHandler, readBody } from 'h3'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import { DataEntryIdSchema, UpdateDataEntrySchema } from '~/server/schemas/data-entries'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  try {
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
      })
    }

    const { data, error } = await DataEntryServices.updateDataEntry(event, id, body)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
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
