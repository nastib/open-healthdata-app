import { defineStore } from 'pinia'
import type { ErrorWithStatus } from '~/types'
import type { EventsLog } from '@prisma/client';
import { toast } from 'vue-sonner';
import { z } from 'zod';
import { CreateEventLogSchema } from '~/server/schemas/events-log.schema';

/**
 * EventsLogStore interface
 * @description Store for events log
 * @returns {EventsLogStore}
 * @example
 * const eventsLogStore = useEventsLogStore()
 * eventsLogStore.fetchEventsLog(userId)
 * eventsLogStore.createEventsLog(event)
 */
interface EventsLogStore {
  eventsLog: Ref<EventsLog | EventsLog[] | null>
  loading: Ref<boolean>
  error: Ref<ErrorWithStatus | null>
  createEventsLog: (event: z.infer<typeof CreateEventLogSchema>) => Promise<void>
  fetchEventsLog: (userId: string) => Promise<void>
}


export const useEventsLogStore = defineStore('events-log', (): EventsLogStore => {
  const eventsLog = ref<EventsLog | EventsLog[] | null>(null)
  const loading = ref(false)
  const error = ref<ErrorWithStatus | null>(null)

  /**
   * Create a new event log
   * @param event
   * @returns
   */
  const createEventsLog = async (eventLog: z.infer<typeof CreateEventLogSchema>) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await $fetch<{data: EventsLog, error?: any}>(`/api/events-log`,{
        method: 'POST',
        body: {
          eventType: eventLog.eventType,
          userId: eventLog.userId,
          metadata: eventLog.metadata || {},
          location: eventLog.location || {},
          createdAt: new Date()
        }
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || 'Failed to create event log'
        }) as ErrorWithStatus
        toast.error(fetchError?.statusMessage || 'Failed to create event log');
        throw createError(fetchError?.statusMessage || 'Failed to create event log')
      }

      eventsLog.value = data
      loading.value = false

    } catch (err: unknown) {
      const message = (err as ErrorWithStatus)?.message || 'Failed to create event log'
      error.value = createError( {statusCode: 404, message: 'Profile not found'}) as ErrorWithStatus
      toast.error(message)
      throw message
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch events log by userId
   * @param userId
   * @returns
   */
  const fetchEventsLog = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await $fetch<{data: EventsLog[], error?: any}>(`/api/events-log/${userId}`,{
        method: 'GET'
      })

      if (fetchError || !data) {
        error.value = createError({
          statusCode: fetchError?.statusCode || 404,
          statusMessage: fetchError?.statusMessage || `${userId} events logs not found`
        }) as ErrorWithStatus
        toast.error(fetchError?.statusMessage || `${userId} events logs not found`);
        throw createError(fetchError?.statusMessage || `${userId} events logs not found`)
      }

      //@ts-ignore
      eventsLog.value = data
      loading.value = false

    } catch (err: unknown) {
      const message = (err as ErrorWithStatus)?.message || 'Failed to fetch events logs'
      error.value = createError( {statusCode: 404, message}) as ErrorWithStatus
      toast.error(message)
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  return {
    eventsLog,
    loading,
    error,
    createEventsLog,
    fetchEventsLog
  }
})

// make sure to pass the right store definition, `useAuth` in this case.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventsLogStore, import.meta.hot))
}
