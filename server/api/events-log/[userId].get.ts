import { CreateEventLogSchema, EventLogUserIdSchema } from '~/server/schemas/events-log.schema';
import { EventsLogServices } from '~/server/services/events-log/index.service';
import { ErrorWithStatus, EventLog } from '~/types';
import { decrypt} from '@/server/utils/crypto-server'

export default defineEventHandler(async event => {
   const eventsLogServices = new EventsLogServices();

  try {

    // Validate input
    const { userId } = event.context.params || {};
    const validationId = EventLogUserIdSchema.safeParse(userId)
    if (!validationId.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validationId.error.format()
      }) as ErrorWithStatus
    }

    //
    const { data, error } = await eventsLogServices.getEventsLogByUserId(validationId.data);

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 400,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
    }

   const hashData = data?.map(async eventLog => {
      if (eventLog?.ipHash) {
        const ipHash = await decrypt(eventLog?.ipHash) as string
        return { ...eventLog, ipHash}
      }
    })

    return { data: hashData, error };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch events log',
    });
  }
});
