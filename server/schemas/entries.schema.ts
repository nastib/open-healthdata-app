import { z } from 'zod'
import { createErrorSchema } from '@/server/utils/error.utils'

// Base entry schema
const EntryBaseSchema = z.object({
  variableCode: z.string().min(1, 'Variable code is required'),
  categoryCode: z.string().min(1, 'Category code is required'),
  organizationElementCode: z.string().min(1, 'Organization element code is required'),
  value: z.number().optional(),
  valid: z.boolean().optional().default(true),
  year: z.number().int().min(1900).max(2100).optional(),
  period: z.string().regex(/^[A-Z0-9]+$/, 'Period must be alphanumeric').optional()
})

// Extended schema with relations
export const EntryWithRelationsSchema = EntryBaseSchema.extend({
  id: z.number().int(),
  createdAt: z.date().nullable(),
  updatedAt: z.date(),
  dataCategory: z.object({
    code: z.string(),
    designation: z.string().nullable(),
    id: z.number().int(),
    createdAt: z.date().nullable(),
    updatedAt: z.date()
  }),
  variable: z.object({
    code: z.string(),
    designation: z.string().nullable(),
  }),
  organizationElement: z.object({
    code: z.string(),
    designation: z.string().nullable(),
  }),
  profile: z.object({
    id: z.string().uuid(),
    username: z.string(),
    lastName: z.string(),
    firstName: z.string(),
    email: z.string().email(),
    createdAt: z.date(),
    updatedAt: z.date(),
    roles: z.array(z.string()).optional()
  })
})

// Extended schema with metadata
export const EntryWithMetadataSchema = EntryBaseSchema.extend({
  id: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid()
})

// Create schema
export const CreateEntrySchema = EntryBaseSchema

// Update schema
export const UpdateEntrySchema = EntryBaseSchema.partial()

// ID validation schema
export const EntryIdSchema = z.number().positive()

// Query parameters schema
export const EntryQuerySchema = z.object({
  categoryCode: z.string().optional(),
  variableCode: z.string().optional(),
  organizationElementCode: z.string().optional(),
  profileId: z.string().uuid().optional(),
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
  valid: z.string().transform(val => val === 'true').optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

// Error schemas
export const EntryErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid input data'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Entry not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected error occurred')
}

// Response schemas
export const EntryResponseSchemas = {
  single: EntryWithMetadataSchema,
  list: z.array(EntryBaseSchema.extend({
    id: EntryIdSchema
  }))
}

// Type exports
export type DataEntry = z.infer<typeof EntryBaseSchema>
export type DataEntryQuery = z.infer<typeof EntryQuerySchema>
export type DataEntryId = z.infer<typeof EntryIdSchema>
export type DataCreateEntryInput = z.infer<typeof CreateEntrySchema>
export type DataUpdateEntryInput = z.infer<typeof UpdateEntrySchema>
export type DataEntryWithMetadata = z.infer<typeof EntryWithMetadataSchema>
export type DataEntryWithRelations = z.infer<typeof EntryWithRelationsSchema>

