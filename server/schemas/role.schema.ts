import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base role schema
const RoleBaseSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code cannot exceed 50 characters')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
  description: z.string().optional()
})

// Create schema
export const CreateRoleSchema = RoleBaseSchema

// Update schema
export const UpdateRoleSchema = RoleBaseSchema.partial()

// ID validation schema
export const RoleIdSchema = z.number().int().positive()

// Query parameters schema
export const RoleQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional()
})

// Error schemas
export const RoleErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Role not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const RoleResponseSchemas = {
  single: RoleBaseSchema.extend({
    id: RoleIdSchema
  }),
  list: z.array(RoleBaseSchema)
}

// Type exports
export type Role = z.infer<typeof RoleBaseSchema>
export type RoleQuery = z.infer<typeof RoleQuerySchema>
export type RoleId = z.infer<typeof RoleIdSchema>
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>

// Legacy export for backwards compatibility
export const RoleSchema = RoleBaseSchema.extend({
  id: RoleIdSchema
})
