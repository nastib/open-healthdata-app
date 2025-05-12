import { CreateEventLogSchema } from '~/server/schemas/events-log.schema';
import { EventsLogServices } from '~/server/services/events-log/index.service';
import { ErrorWithStatus, EventLog } from '~/types';

export default defineEventHandler(async event => {
  const eventsLogServices = new EventsLogServices();

  try {

    // Validate input
    const body = await readBody(event)

    const validation = CreateEventLogSchema.safeParse(body)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error?.format()
      }) as ErrorWithStatus

    }

    const { data, error } = await eventsLogServices.createEvent({
      ipHash: getRequestIP(event, { xForwardedFor: true }) || '',
      userAgent: getRequestHeader(event, 'user-agent') || '',
      ...validation.data
    });

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 400,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
    }

    return { data, error };
  } catch (error) {
    console.error('Failed to create event log:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create event log',
    });
  }
});
