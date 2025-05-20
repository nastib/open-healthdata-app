import { defineEventHandler, readBody } from 'h3';
import { CategoryServices } from '~/server/services/categories/index.service';
import { CategoryIdSchema, UpdateCategorySchema } from '~/server/schemas/categories.schema';
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server';


export default defineEventHandler(async event => {
  const { updateCategory } = new CategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const categoriesPermissions = new CategoriesPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const categoryId = Number(event.context.params?.id)

    if (!await categoriesPermissions.canUpdate(user.profile, categoryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this data category'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    const validation = UpdateCategorySchema.safeParse(body);
    const validationId = CategoryIdSchema.safeParse(id);

    if (!validation.success || !validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: {
          ...validation.error?.format(),
          ...validationId.error?.format(),
        },
      });
    }

    // Update data category
    const { data, error } = await updateCategory(id, validation.data);

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error,
      });
    }

    return {
      success: true,
      data: data,
    };
  } catch (error: unknown) {
    const err = error as ErrorWithStatus;
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
    });
  }
});
