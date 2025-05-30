import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base variable schema
const VariableBaseSchema = z.object({
  code: z.string().min(1, 'Variable code is required'),
  designation: z.string().optional(),
  dataSourceId: z.number().int().positive('Data source ID must be positive'),
  categoryCode: z.string().min(1, 'Category code is required'),
  frequency: z.string().optional(),
  level: z.string().optional(),
  type: z.array(z.unknown()).optional().default([])
})

// Extended schema with relations
export const VariableWithRelationsSchema = VariableBaseSchema.extend({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  dataSource: z.object({
    id: z.number(),
    designation: z.string().optional()
  }),
  dataCategory: z.object({
    code: z.string(),
    designation: z.string().optional()
  })
})

// Extended schema with metadata
export const VariableWithMetadataSchema = VariableBaseSchema.extend({
  id: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Create schema
export const CreateVariableSchema = VariableBaseSchema

// Update schema
export const UpdateVariableSchema = VariableBaseSchema.partial()

// ID validation schema
export const VariableIdSchema = z.number().positive()

// Query parameters schema
export const VariableQuerySchema = z.object({
  code: z.string().optional(),
  categoryCode: z.string().optional(),
  dataSourceId: z.string().transform(Number).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

// Error schemas
export const VariableErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Variable not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const VariableResponseSchemas = {
  single: VariableWithMetadataSchema,
  list: z.array(VariableBaseSchema.extend({
    id: VariableIdSchema
  }))
}

// Type exports
export type Variable = z.infer<typeof VariableBaseSchema>
export type VariableQuery = z.infer<typeof VariableQuerySchema>
export type VariableId = z.infer<typeof VariableIdSchema>
export type CreateVariableInput = z.infer<typeof CreateVariableSchema>
export type UpdateVariableInput = z.infer<typeof UpdateVariableSchema>
export type VariableWithMetadata = z.infer<typeof VariableWithMetadataSchema>
export type VariableWithRelations = z.infer<typeof VariableWithRelationsSchema>
