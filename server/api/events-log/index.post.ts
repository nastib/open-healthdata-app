import { EventsLogServices } from '~/server/services/events-log/index.service';
import { EventLog } from '~/types';

export default defineEventHandler(async event => {
  const body = await readBody(event);

  if (!body) {
    return {
      data: null,
      error: createError({
        statusCode: 400,
        statusMessage: 'Missing event data',
      }),
    };
  }

  try {
    const { data, error } = await EventsLogServices.createEvent({
      eventType: body.eventType,
      userId: body.userId,
      ipHash: body.ipAddress || getRequestHeader(event, 'x-forwarded-for') || '',
      userAgent: body.userAgent || getRequestHeader(event, 'user-agent'),
      metadata: body.metadata || {},
      createdAt: body.createdAt || new Date(),
    } as EventLog);

    return { data, error };
  } catch (error) {
    console.error('Failed to create event log:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create event log',
    });
  }
});
