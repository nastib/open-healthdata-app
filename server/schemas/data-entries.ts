import { z } from 'zod'

export const DataEntryIdSchema = z.number().positive()

export const UpdateDataEntrySchema = z.object({
  variableCode: z.string().optional(),
  categoryCode: z.string().optional(),
  organizationElementCode: z.string().optional(),
  value: z.number().optional(),
  valid: z.boolean().optional(),
  year: z.number().optional(),
  period: z.string().optional()
})

export const CreateDataEntrySchema = z.object({
  variableCode: z.string(),
  categoryCode: z.string(),
  organizationElementCode: z.string(),
  value: z.number().optional(),
  valid: z.boolean().optional(),
  year: z.number().optional(),
  period: z.string().optional()
})

export const DataEntryQuerySchema = z.object({
  categoryCode: z.string().optional(),
  variableCode: z.string().optional(),
  organizationElementCode: z.string().optional(),
  profileId: z.string().optional(),
  year: z.string().optional(),
  valid: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional()
})

export type DataEntryQuery = z.infer<typeof DataEntryQuerySchema>
