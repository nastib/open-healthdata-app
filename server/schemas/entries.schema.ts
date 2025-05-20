import { z } from 'zod'

export const EntryIdSchema = z.number().positive()

export const UpdateEntrySchema = z.object({
  variableCode: z.string().optional(),
  categoryCode: z.string().optional(),
  organizationElementCode: z.string().optional(),
  value: z.number().optional(),
  valid: z.boolean().optional(),
  year: z.number().optional(),
  period: z.string().optional()
})

export const CreateEntrySchema = z.object({
  variableCode: z.string(),
  categoryCode: z.string(),
  organizationElementCode: z.string(),
  value: z.number().optional(),
  valid: z.boolean().optional(),
  year: z.number().optional(),
  period: z.string().optional()
})

export const EntryQuerySchema = z.object({
  categoryCode: z.string().optional(),
  variableCode: z.string().optional(),
  organizationElementCode: z.string().optional(),
  profileId: z.string().optional(),
  year: z.string().optional(),
  valid: z.string().optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.enum(['asc', 'desc']).optional()
})

// export type DataEntryQuery = z.infer<typeof DataEntryQuerySchema>
// export type CreateDataEntryInput = z.infer<typeof CreateDataEntrySchema>
// export type UpdateDataEntryInput = z.infer<typeof UpdateDataEntrySchema>
// export type DataEntryId = z.infer<typeof DataEntryIdSchema>

