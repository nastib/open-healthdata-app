import { defineEventHandler, getQuery } from 'h3'
import { DataCategoryServices } from '~/server/services/data-categories/index.service'
import { DataCategoryQuerySchema } from '~/server/schemas/data-categories.schema'
import type { ErrorWithStatus } from '@/types/index'

export default defineEventHandler(async (event) => {
  const { getDataCategories } = new DataCategoryServices()

  try {
    // Check user role
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_VIEWER')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions',
        data: user.profile.roles.map(role => role.code).join(', ')
      })
    }

    // Validate query params
    const query = getQuery(event)
    const validation = DataCategoryQuerySchema.safeParse(query)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    const { data, error: error } = await getDataCategories(validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      })
    }

    return {
      success: true,
      data: data,
      meta: {
        count: data?.length || 0
      }
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
