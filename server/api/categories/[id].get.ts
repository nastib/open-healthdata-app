import { defineEventHandler } from 'h3'
import { CategoryServices } from '~/server/services/categories/index.service'
import { CategoryIdSchema } from '~/server/schemas/categories.schema' // Assuming this schema validates just an ID
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '@/server/utils/auth.server'

export default defineEventHandler(async (event) => {
  const { fetchCategoryById } = new CategoryServices() // Assuming this method exists or will be created
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const categoriesPermissions = new CategoriesPermissions()


  try {
    const categoryIdString = event.context.params?.id
    const categoryId = Number(categoryIdString)

    // Validate input ID
    const validationId = CategoryIdSchema.safeParse(categoryId) // Or a schema specifically for ID
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error - Invalid Category ID',
        data: validationId.error?.format()
      })
    }

    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    if (!await categoriesPermissions.canView(user.profile, validationId.data)) { // Pass the validated ID
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view this data category'
      })
    }

    // Fetch data category
    const { data, error } = await fetchCategoryById(validationId.data)

    if (error || !data) {
      const serviceError = error as ErrorWithStatus
      throw createError({
        statusCode: serviceError?.statusCode || 404,
        statusMessage: serviceError?.statusMessage || `Data category with ID ${validationId.data} not found. ${serviceError?.message || ''}`,
        data: serviceError
      })
    }

    return {
      success: true,
      data: data
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    // Log the error for debugging, potentially redacting sensitive info
    // console.error("Error in [id].get.ts for data-categories:", redactSensitive(err));
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data // Be cautious about exposing too much error data
    })
  }
})
