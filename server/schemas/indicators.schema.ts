import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base indicator schema
const IndicatorBaseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  designation: z.string().optional(),
  definition: z.string().optional(),
  goal: z.string().optional(),
  formula: z.string().optional(),
  categoryCode: z.string().min(1, 'Category code is required'),
  level: z.string().optional(),
  calculationMethod: z.string().optional(),
  collectionFrequency: z.string().optional(),
  constraints: z.string().optional(),
  interpretation: z.string().optional(),
  example: z.string().optional()
})

// Extended schema with relations
export const IndicatorWithRelationsSchema = IndicatorBaseSchema.extend({
  id: z.number().int(),
  createdAt: z.date().nullable(),
  updatedAt: z.date(),
  dataCategory: z.object({
    code: z.string(),
    designation: z.string().nullable(),
    id: z.number().int(),
    createdAt: z.date().nullable(),
    updatedAt: z.date()
  })
})

// Create schema
export const CreateIndicatorSchema = IndicatorBaseSchema

// Update schema
export const UpdateIndicatorSchema = IndicatorBaseSchema.partial()

// ID validation schema
export const IndicatorIdSchema = z.number().int()

// Query parameters schema
export const IndicatorQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional()
})

// Error schemas
export const IndicatorErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Indicator not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const IndicatorResponseSchemas = {
  single: IndicatorBaseSchema.extend({
    id: IndicatorIdSchema,
    createdAt: z.date(),
    updatedAt: z.date()
  }),
  list: z.array(IndicatorBaseSchema),
  withRelations: IndicatorWithRelationsSchema
}

// Type exports
export type Indicator = z.infer<typeof IndicatorBaseSchema> & {
  id?: number
  createdAt?: Date | null
  updatedAt?: Date
}
export type IndicatorQuery = z.infer<typeof IndicatorQuerySchema>
export type IndicatorId = z.infer<typeof IndicatorIdSchema>
export type CreateIndicatorInput = z.infer<typeof CreateIndicatorSchema>
export type UpdateIndicatorInput = z.infer<typeof UpdateIndicatorSchema>
export type IndicatorWithRelations = z.infer<typeof IndicatorWithRelationsSchema>
