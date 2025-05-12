import { defineEventHandler, readBody } from 'h3';
import { DataCategoryServices } from '@/server/services/data-categories/index.service';
import { DataCategoryIdSchema, UpdateDataCategorySchema } from '~/server/schemas/data-categories.schema';
import type { ErrorWithStatus } from '@/types/index'


export default defineEventHandler(async event => {
  const { updateDataCategory } = new DataCategoryServices()

  try {
    // Check user role
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_EDITOR')) {
      return {
        data: null,
        error: createError({ statusCode: 403, message: 'Forbidden - Insufficient permissions' })
      }
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
