import { defineEventHandler } from 'h3'
import { DataEntryIdSchema } from '~/server/schemas/data-entries'
import { DataEntryServices } from '~/server/services/data-entries/index.service'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(event.context.params?.id)

    const validationId = DataEntryIdSchema.safeParse(id)

    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      })
    }

    const { data, error } = await DataEntryServices.deleteDataEntry(event, id)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      })
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
