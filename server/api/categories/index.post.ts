import { defineEventHandler, readBody } from 'h3'
import { CategoryServices } from '~/server/services/categories/index.service'
import { CreateCategorySchema, CategoryErrorSchemas } from '~/server/schemas/categories.schema'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { createCategory } = new CategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const categoriesPermissions = new CategoriesPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await categoriesPermissions.canCreate(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to create data categories'
      })
    }

    // Validate input
    const body = await readBody(event)
    const validation = CreateCategorySchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    const { data , error } = await createCategory(validation.data)

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
