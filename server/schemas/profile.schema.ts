import { z } from 'zod'
import { RoleSchema } from './role.schema'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base profile schema
const ProfileBaseSchema = z.object({
  userId: z.string().uuid(),
  username: z.string().min(1).nullable(),
  firstName: z.string().min(1).nullable(),
  lastName: z.string().min(1).nullable(),
  bio: z.string().nullable(),
  active: z.boolean().default(true),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  theme: z.string().nullable(),
  avatar: z.string().nullable(),
  phone: z.string().nullable(),
  organizationElementCode: z.string().nullable()
})

// Extended schema with roles
export const ProfileWithRolesSchema = ProfileBaseSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  roles: z.array(RoleSchema)
})

// Create schema
export const CreateProfileSchema = ProfileBaseSchema

// Update schema
export const UpdateProfileSchema = ProfileBaseSchema.partial()

// ID validation schemas
export const ProfileIdSchema = z.number().int().positive()
export const ProfileUserIdSchema = z.string().uuid()

// Query parameters schema
export const ProfileQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional()
})

// Error schemas
export const ProfileErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Profile not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const ProfileResponseSchemas = {
  single: ProfileBaseSchema.extend({
    id: ProfileIdSchema,
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  list: z.array(ProfileBaseSchema),
  withRoles: ProfileWithRolesSchema
}

// Type exports
export type Profile = z.infer<typeof ProfileBaseSchema>
export type ProfileQuery = z.infer<typeof ProfileQuerySchema>
export type ProfileId = z.infer<typeof ProfileIdSchema>
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type ProfileWithRoles = z.infer<typeof ProfileWithRolesSchema>
