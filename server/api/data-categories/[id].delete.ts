import { defineEventHandler, H3Event } from 'h3';
import { DataCategoryIdSchema } from '~/server/schemas/data-categories.schema'
import { DataCategoryServices } from '~/server/services/data-categories/index.service'
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server'

export default defineEventHandler(async (event: H3Event) => {
  const { deleteDataCategory } = new DataCategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUser, getPermissions } = authServer

  try {
    // Check user permissions
    const user = await getAuthenticatedUser(event)
    const categoryId = Number(event.context.params?.id)
    if (!await getPermissions().canDeleteDataCategory(user, categoryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to delete this data category'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id)
    const validationId = DataCategoryIdSchema.safeParse(id);

    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error?.format()
      });
    }

    // Delete data category
    const { data, error } = await deleteDataCategory(validationId.data)

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
