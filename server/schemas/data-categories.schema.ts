import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'
import { type AvatarFallbackProps } from 'reka-ui';

// Base data category schema
const DataCategoryBaseSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(50, 'Code cannot exceed 50 characters')
    .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
  designation: z.string()
    .min(3, 'Designation must be at least 3 characters')
    .max(100, 'Designation cannot exceed 100 characters')
})

// Create schema
export const CreateDataCategorySchema = DataCategoryBaseSchema

// Update schema
export const UpdateDataCategorySchema = DataCategoryBaseSchema.partial()

// ID validation schema
export const DataCategoryIdSchema = z.number().int().positive()

// Query parameters schema
export const DataCategoryQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional()
})

// Error schemas
export const DataCategoryErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Data category not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const DataCategoryResponseSchemas = {
  single: DataCategoryBaseSchema.extend({
    id: DataCategoryIdSchema,
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  list: z.array(DataCategoryBaseSchema)
}

// export type DataCategory = z.infer<typeof DataCategoryBaseSchema>
// export type DataCategoryQuery = z.infer<typeof DataCategoryQuerySchema>
// export type DataCategoryId = z.infer<typeof DataCategoryIdSchema>
// export type CreateDataCategoryInput = z.infer<typeof CreateDataCategorySchema>
// export type UpdateDataCategoryInput = z.infer<typeof UpdateDataCategorySchema>
