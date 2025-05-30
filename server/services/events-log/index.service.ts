// Server-only audit logging service
import type { Prisma } from '@prisma/client'
import type { ErrorWithStatus } from '~/types'
import type { EventsLog } from '@prisma/client'
import { CreateEventLogSchema, EventLogUserIdSchema } from '~/server/schemas/events-log.schema';
import { z } from 'zod';
import prisma from '@/server/utils/prisma'

/**
 * EventLog interface
 */
interface EventLogServices {
  createEvent: (input: z.infer<typeof CreateEventLogSchema>) => Promise<{ data: EventsLog | null; error: ErrorWithStatus | null }>,
  getEventsLogByUserId: (userId: z.infer<typeof EventLogUserIdSchema>) => Promise<{ data: EventsLog[] | null; error: ErrorWithStatus | null }>
  deleteEventsLogByUserId: (userId: z.infer<typeof EventLogUserIdSchema>) => Promise<{ data: EventsLog[] | null; error: ErrorWithStatus | null }>
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
  async deleteEventsLogByUserId(userId: z.infer<typeof EventLogUserIdSchema>): Promise<{ data: EventsLog[] | null; error: ErrorWithStatus | null }> {
    let error: ErrorWithStatus | null;
    try {
      const data = await prisma.eventsLog.deleteMany({
        where: {
          userId
        }
      }) as unknown as EventsLog[];

      if (!data){
        return {
          data: null,
          error: {
            name: 'ProfileDeleteError',
            statusCode: 404,
            statusMessage: 'Failed to delete profile',
            message: `Failed to delete profile`
          }
        }
      }

      return {
        data,
        error: null
      }
    } catch (err) {
      error = createError({ statusCode: 500, message: 'Failed to delete logs' }) as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'DataEntryCreateError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to delete logs',
          message: error.message
        }
      }
    }
  }
  /**
   * Logs an authentication event to the database.
   * SERVER-ONLY - Do not use in client code
   */
  async createEvent (input: z.infer<typeof CreateEventLogSchema>): Promise<{ data: EventsLog | null; error: ErrorWithStatus | null }> {
    //const ipHash = await bcrypt.hash(event.ipAddress, 10)
    let error: ErrorWithStatus | null = null
    try {
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
        return {
          data: null,
          error: {
            name: 'ProfileDeleteError',
            statusCode: 406,
            statusMessage: 'Failed to create event',
            message: `Failed to create event`
          }
        }
      }

      return {
        data,
        error
      }
    } catch (err) {
      error = createError({ statusCode: 500, message: 'Failed to delete logs' }) as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'EventsLogsCreateError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to delete logs',
          message: error.message
        }
      }
    }


  }

  /**
   * Fetches events log by userId
   * @param id
   * @returns
   */
  async getEventsLogByUserId (userId: z.infer<typeof EventLogUserIdSchema>): Promise<{ data: EventsLog[] | null; error: ErrorWithStatus | null }> {
    let error: ErrorWithStatus | null

    try {
      const data = await prisma.eventsLog.findMany({
        where: {
          userId
        }
      }) as unknown as EventsLog[];

      if (!data) {
        error = createError({ statusCode: 404, message: 'Logs not found' }) as ErrorWithStatus;
        console.log({
          statusCode: 404,
          statusMessage: 'Logs not found'
        })
      }

      return {
        data,
        error: null
      }
    } catch (err) {
      error = createError({ statusCode: 500, message: 'Failed to delete logs' }) as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'EventsLogsCreateError',
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || 'Failed to delete logs',
          message: error.message
        }
      }
    }

  }
}


