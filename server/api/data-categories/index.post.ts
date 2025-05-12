import { defineEventHandler, readBody } from 'h3'
import { DataCategoryServices } from '~/server/services/data-categories/index.service'
import { CreateDataCategorySchema, DataCategoryErrorSchemas } from '~/server/schemas/data-categories.schema'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { createDataCategory } = new DataCategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUser, getPermissions } = authServer

  try {
    // Check user permissions
    const user = await getAuthenticatedUser(event)
    if (!getPermissions().canCreateDataCategory(user)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create data categories'
      })
    }

    // Validate input
    const body = await readBody(event)
    const validation = CreateDataCategorySchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    const { data , error } = await createDataCategory(validation.data)

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
