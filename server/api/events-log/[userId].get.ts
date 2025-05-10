import { EventsLogService } from '@/server/services/events-log/index.service';
import { EventLog } from '~/types';

export default defineEventHandler(async event => {
  const { userId } = event.context.params || {};

  if (!userId) {
    return {
      data: null,
      error: createError({
        statusCode: 400,
        statusMessage: 'Missing user Id',
      }),
    };
  }

  try {
    const { data, error } = await EventsLogService.getEventsLogById(userId);
    return { data, error };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch events log',
    });
  }
});
