import { z } from 'zod'


export const CreateEventLogSchema = z.object({
  eventType: z.string(),
  userId: z.string().optional(),
  ipHash: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional(),
  location: z.any({}).optional(),
})


export const EventLogQuerySchema = z.object({
  eventType: z.string().optional(),
  userId: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional()
})

export const EventLogUserIdSchema = z.string()

// export type CreateEventLogInput = z.infer<typeof CreateEventLogSchema>
// export type EventLogQuery = z.infer<typeof EventLogQuerySchema>
// export type EventLogUserId = z.infer<typeof EventLogUserIdSchema>

