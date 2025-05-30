import { z } from 'zod'
import { createErrorSchema } from '~/server/utils/error.utils'

// Base organization schema
const OrganizationBaseSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code cannot exceed 50 characters')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().nullable()
})

// Create schema
export const CreateOrganizationSchema = OrganizationBaseSchema

// Update schema
export const UpdateOrganizationSchema = OrganizationBaseSchema.partial()

// ID validation schema
export const OrganizationIdSchema = z.number().int().positive()

// Query parameters schema
export const OrganizationQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

// Error schemas
export const OrganizationErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Organization not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const OrganizationResponseSchemas = {
  single: OrganizationBaseSchema.extend({
    id: OrganizationIdSchema,
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  list: z.array(OrganizationBaseSchema.extend({
    id: OrganizationIdSchema,
    createdAt: z.date(),
    updatedAt: z.date()
  }))
}

export type Organization = z.infer<typeof OrganizationResponseSchemas.single>
export type OrganizationElement = Organization // Alias for clarity with Prisma model
export type OrganizationQuery = z.infer<typeof OrganizationQuerySchema>
export type OrganizationId = z.infer<typeof OrganizationIdSchema>
export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>
