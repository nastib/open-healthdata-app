import type { JsonValue } from '@prisma/client/runtime/library'

// export interface Indicator {
//   id: string
//   createdAt: Date | null
//   updatedAt: Date
//   code: string
//   designation: string | null
//   type: JsonValue
//   dataSourceId: number
//   categoryCode: string
//   frequency: string | null
//   level: string | null
// }

// export interface DataSource {
//   id: string
//   createdAt: Date | null
//   updatedAt: Date
//   code: string
//   name: string
//   description: string | null
//   url: string | null
// }

export interface ErrorWithStatus {
  statusCode: number
  statusMessage: string
  message?: string
  data?: unknown
  name?: string
}

// export interface Variable {
//   id: string
//   name: string
//   description: string | null
//   createdAt: Date
//   updatedAt: Date
// }
