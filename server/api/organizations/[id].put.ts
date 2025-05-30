import { defineEventHandler, readBody, createError } from 'h3';
import { OrganizationServices } from '~/server/services/organizations/index.service';
import { OrganizationIdSchema, UpdateOrganizationSchema } from '~/server/schemas/organizations.schemas';
import type { ErrorWithStatus } from '~/types'
import { AuthServer } from '~/server/utils/auth.server';
import { OrganizationsPermissions } from '~/server/utils/permissions/organizations.permissions';


export default defineEventHandler(async event => {
  const { updateOrganization } = new OrganizationServices()
  const authServer = new AuthServer()
  const { getAuthenticatedUserFromJWT } = authServer
  const organizationsPermissions = new OrganizationsPermissions()


  try {
    // Check user permissions
    const user = await getAuthenticatedUserFromJWT(event)
    const organizationId = Number(event.context.params?.id)

    if (!await organizationsPermissions.canUpdate(user.profile, organizationId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to update this organization'
      })
    }

    // Validate input
    const id = Number(event.context.params?.id);
    const body = await readBody(event);
    const validation = UpdateOrganizationSchema.safeParse(body);
    const validationId = OrganizationIdSchema.safeParse(id);

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

    // Update organization
    const { data, error } = await updateOrganization(id, validation.data);

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
