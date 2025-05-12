// Server-only audit logging service
import type { Prisma } from '@prisma/client'
import type { ErrorWithStatus, EventLog } from '~/types'
import { CreateEventLogSchema, EventLogUserIdSchema } from '~/server/schemas/events-log.schema';
import { z } from 'zod';
import prisma from '@/server/utils/prisma'
//import { hashString } from '~/server/utils/crypto.server'

/**
 * EventLog interface
 */
interface EventLogServices {
  createEvent: (input: z.infer<typeof CreateEventLogSchema>) => Promise<{ data: EventLog | null; error: ErrorWithStatus | null }>,
  getEventsLogByUserId: (userId: z.infer<typeof EventLogUserIdSchema>) => Promise<{ data: EventLog[] | null; error: ErrorWithStatus | undefined }>
  deleteEventsLogByUserId: (userId: z.infer<typeof EventLogUserIdSchema>) => Promise<{ data: any | null; error: ErrorWithStatus | undefined }>
}

/**
 * EventLog service
 * @type {EventLogServices}
 * @description This service is responsible for logging events to the database.
 * It is used for auditing purposes and should not be used in client code.
 */
export class EventsLogServices implements EventLogServices {

  /**
   * Deletes events log by userId
   * @param userId
   * @returns
   */
  async deleteEventsLogByUserId(userId: z.infer<typeof EventLogUserIdSchema>): Promise<{ data: any | null; error: ErrorWithStatus | undefined }> {
    let error: ErrorWithStatus | undefined;

    try {
      const data = await prisma.eventsLog.deleteMany({
        where: {
          userId
        }
      });

      if (data.count === 0) {
        error = createError({ statusCode: 404, message: 'No logs found to delete' });
        console.log({
          statusCode: 404,
          statusMessage: 'No logs found to delete'
        });
      }

      return {
        data,
        error
      };
    } catch (err) {
      error = createError({ statusCode: 500, message: 'Failed to delete logs' });
      console.error({
        statusCode: 500,
        statusMessage: 'Failed to delete logs',
        error: err
      });

      return {
        data: null,
        error
      };
    }
  }
  /**
   * Logs an authentication event to the database.
   * SERVER-ONLY - Do not use in client code
   */
  async createEvent (input: z.infer<typeof CreateEventLogSchema>): Promise<{ data: EventLog | null; error: ErrorWithStatus | null }> {
    //const ipHash = await bcrypt.hash(event.ipAddress, 10)
    let error: ErrorWithStatus | null = null

    const data = await prisma.eventsLog.create({
      data: {
        eventType: input.eventType,
        userId: input.userId,
        ipHash: input?.ipHash ? input.ipHash : null,
        //ipHash: event?.ipHash ? await bcrypt.hash(event?.ipHash, 10) :'',
        userAgent: input.userAgent,
        metadata: input.metadata ? input.metadata as Prisma.InputJsonValue : undefined,
      }
    })

    if (!data) {
      error = createError( {statusCode: 406, message: 'Failed to create event'})
      console.log({
        statusCode: 406,
        statusMessage: 'Failed to create event'
      })
    }

    return {
      data,
      error
    }

  }

  /**
   * Fetches events log by userId
   * @param id
   * @returns
   */
  async getEventsLogByUserId (userId: z.infer<typeof EventLogUserIdSchema>): Promise<{ data: EventLog[] | null; error: Error | undefined }> {
    let error: ErrorWithStatus | undefined

    const data = await prisma.eventsLog.findMany({
      where: {
        userId
      }
    })

    if (!data) {
      error = createError({ statusCode: 404, message: 'Logs not found' })
      console.log({
        statusCode: 404,
        statusMessage: 'Logs not found'
      })
    }

    return {
      data,
      error
    }
  }
}


