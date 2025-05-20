import { defineEventHandler, H3Event } from 'h3';
import { CategoryIdSchema } from '~/server/schemas/categories.schema'
import { CategoryServices } from '~/server/services/categories/index.service'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event: H3Event) => {
  const { deleteCategory } = new CategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const categoriesPermissions = new CategoriesPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const categoryId = Number(event.context.params?.id)
    if (!await categoriesPermissions.canDelete(user.profile, categoryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this data category'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id)
    const validationId = CategoryIdSchema.safeParse(id);

    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      });
    }

    // Delete data category
    const { data, error } = await deleteCategory(validationId.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error,
      });
    }

    return {
      success: true,
      message: 'Data category deleted successfully'
    }
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error'
    })
  }
})
