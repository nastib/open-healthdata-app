import { defineEventHandler, readBody } from 'h3';
import { DataCategoryServices } from '@/server/services/data-categories/index.service';
import { DataCategoryIdSchema, UpdateDataCategorySchema } from '~/server/schemas/data-categories.schema';
import type { ErrorWithStatus } from '@/types/index'
import { AuthServer } from '~/server/utils/auth.server';


export default defineEventHandler(async event => {
  const { updateDataCategory } = new DataCategoryServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUser, getPermissions } = authServer

  try {
    // Check user permissions
    const user = await getAuthenticatedUser(event)
    const categoryId = Number(event.context.params?.id)
    if (!await getPermissions().canUpdateDataCategory(user, categoryId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this data category'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    const validation = UpdateDataCategorySchema.safeParse(body);
    const validationId = DataCategoryIdSchema.safeParse(id);

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
    const { data, error } = await updateDataCategory(id, validation.data);

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
