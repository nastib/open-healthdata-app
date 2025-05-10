// Server-only audit logging service
import type { Prisma } from '@prisma/client'
import type { EventLog } from '~/types'
import prisma from '@/server/utils/prisma'
//import { hashString } from '~/server/utils/crypto.server'

export const EventTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  AUDIT_LOG: 'AUDIT_LOG'
} as const


export const EventsLogService: {
  createEvent: (event: EventLog) => Promise<{ data: EventLog | null; error: Error | null }>;
  getEventsLogById: (id: string) => Promise<{ data: EventLog[] | null; error: Error | undefined }>;
} = {
  /**
   * Logs an authentication event to the database.
   * SERVER-ONLY - Do not use in client code
   */
  createEvent: async (event: EventLog) => {
    //const ipHash = await bcrypt.hash(event.ipAddress, 10)
    let error: Error | null = null

    const newEvent = await prisma.eventsLog.create({
      data: {
        eventType: event.eventType,
        userId: event.userId,
        ipHash: event?.ipHash ? event.ipHash : null,
        //ipHash: event?.ipHash ? await bcrypt.hash(event?.ipHash, 10) :'',
        userAgent: event.userAgent,
        metadata: event.metadata ? event.metadata as Prisma.InputJsonValue : undefined,
        createdAt: new Date(),
      }
    })

    if (!newEvent) {
      error = createError( {statusCode: 406, message: 'Failed to create event'})
      console.log({
        statusCode: 406,
        statusMessage: 'Failed to create event'
      })
    }

    return {
      data: newEvent || null,
      error
    }

  },

  /**
   * Fetches events log by userId
   * @param id
   * @returns
   */
  getEventsLogById: async (id: string) => {
    let error: Error | undefined

    const eventsById = await prisma.eventsLog.findMany({
      where: {
        userId: id
      }
    })

    if (!eventsById) {
      error = createError({ statusCode: 404, message: 'Logs not found' })
      console.log({
        statusCode: 404,
        statusMessage: 'Logs not found'
      })
    }



    return {
      data: eventsById || null,
      error
    }
  }
}


