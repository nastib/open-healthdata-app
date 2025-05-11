import { defineEventHandler, readBody } from 'h3'
import { DataCategoryServices } from '~/server/services/data-categories/index.service'
import { CreateDataCategorySchema, DataCategoryErrorSchemas } from '~/server/schemas/data-categories'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate input
    const validation = CreateDataCategorySchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    const { data , error } = await DataCategoryServices.createDataCategory(event, validation.data)

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
