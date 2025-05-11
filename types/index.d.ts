/**
 * This section contains TypeScript import types from the Prisma client
 */
import type { Profile, Role, EventsLog, DataCategory } from '@prisma/client'
import type { User } from '@supabase/supabase-js';

/**
 * This section contains TypeScript types and interfaces used throughout the application.
 */
export type { Profile, Role, EventsLog, DataCategory } from '@prisma/client'

export interface AuthError extends Error {
  message: string,
  status?: number
}

export type ProfileWithRoles = Profile & {
  roles: Role[],
  user: User
}

export type EventLog = EventsLog

export interface ErrorWithStatus extends Error {
  statusCode?: number
  statusMessage?: string
  data?: any
}
