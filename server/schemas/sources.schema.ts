import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base data source schema
const SourceBaseSchema = z.object({
  code: z.string().min(1, 'Code is required')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  url: z.string().url('Invalid URL format').nullable().optional()
})

// Extended schema with metadata
export const SourceWithMetadataSchema = SourceBaseSchema.extend({
  id: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Create schema
export const SourceCreateSchema = SourceBaseSchema

// Update schema
export const SourceUpdateSchema = SourceBaseSchema.partial()

// ID validation schema
export const SourceIdSchema = z.number().int().positive()

// Query parameters schema
export const SourceQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  search: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional()
})

// Error schemas
export const SourceErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Data source not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const SourceResponseSchemas = {
  single: SourceWithMetadataSchema,
  list: z.array(SourceBaseSchema.extend({
    id: SourceIdSchema
  }))
}

// Type exports
export type DataSource = z.infer<typeof SourceBaseSchema>
export type DataSourceQuery = z.infer<typeof SourceQuerySchema>
export type DataSourceId = z.infer<typeof SourceIdSchema>
export type CreateDataSourceInput = z.infer<typeof SourceCreateSchema>
export type UpdateDataSourceInput = z.infer<typeof SourceUpdateSchema>
export type DataSourceWithMetadata = z.infer<typeof SourceWithMetadataSchema>

// Legacy exports for backwards compatibility
export const DataSourceSchema = SourceWithMetadataSchema
