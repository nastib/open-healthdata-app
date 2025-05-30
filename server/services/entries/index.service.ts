import prisma from '@/server/utils/prisma'
import type { ErrorWithStatus } from '@/types/index'
import { z } from 'zod'
import type {  DataEntry } from '@prisma/client'
import {
  CreateEntrySchema,
  UpdateEntrySchema,
  EntryIdSchema,
  EntryQuerySchema,
} from '@/server/schemas/entries.schema'

interface EntryService {
   fetchEntries : (query: z.infer< typeof EntryQuerySchema>) => Promise<{ data: DataEntry[] | null, error: ErrorWithStatus | null }>;
   fetchEntryById : (id: z.infer< typeof EntryIdSchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   createEntry : (input: z.infer<typeof CreateEntrySchema>) =>  Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   updateEntry : (id: z.infer<typeof EntryIdSchema>, input: z.infer<typeof UpdateEntrySchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   deleteEntry: (id: z.infer<typeof EntryIdSchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>
}
export class EntryServices implements EntryService {
  /**
   * Get data entry by ID
   * @param id
   * @returns
   */
  async fetchEntryById(
    id: z.infer<typeof EntryIdSchema>
  ): Promise<{ data: DataEntry | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataEntry.findUnique({
        where: { id },
        include: {
          dataCategory: true,
          organizationElement: true,
          variable: true,
          profile: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataEntryNotFoundError',
            statusCode: 404,
            statusMessage: 'Data entry not found',
            message: `No data entry found with ID: ${id}`
          }
        };
      }

      return { data, error: null };
    } catch (error: unknown) {
      const err = error as ErrorWithStatus;
      return {
        data: null,
        error: {
          name: 'DataEntryServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch data entry by ID',
          message: err.message
        }
      };
    }
  }

  /**
   * Get all data entries
   * @param query
   * @returns
   */
  async fetchEntries(query: z.infer<typeof EntryQuerySchema>): Promise<{ data: DataEntry[] | null, error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataEntry.findMany({
        where: {
          categoryCode: query.search ? { contains: query.search } : undefined
        },
        take: query.limit,
        skip: query.offset,
        orderBy: {
          id: query.sort === 'asc' ? 'asc' : 'desc'
        },
        include: {
          dataCategory: true,
          organizationElement: true,
          profile: true,
          variable: true
        }
      })


      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataEntryNotFoundError',
            statusCode: 404,
            statusMessage: 'Data entry not found',
            message: `No data entry found`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataEntryServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch data entries',
          message: err.message
        }
      }
    }
  }

  /**
   * Create new data entry
   * @param input
   * @returns
   */
  async createEntry(
    input: z.infer<typeof CreateEntrySchema>
  ): Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataEntry.create({
        data: {
          variableCode: input.variableCode,
          categoryCode: input.categoryCode,
          organizationElementCode: input.organizationElementCode,
          value: input.value,
          valid: input.valid,
          year: input.year,
          period: input.period ? new Date(input.period) : undefined
        },
        include: {
          dataCategory: true,
          organizationElement: true,
          variable: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataEntryNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to create entry',
            message: `Failed to create data entry`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataEntryCreateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to create data entry',
          message: err.message
        }
      }
    }
  }

  /**
   *
   * @param event
   * @param id
   * @param input
   * @returns
   */
  async updateEntry(
    id: z.infer<typeof EntryIdSchema>,
    input: z.infer<typeof UpdateEntrySchema>
  ): Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataEntry.update({
        where: { id },
        data: {
          variableCode: input.variableCode,
          categoryCode: input.categoryCode,
          organizationElementCode: input.organizationElementCode,
          value: input.value,
          valid: input.valid,
          year: input.year,
          period: input.period ? new Date(input.period) : undefined
        },
        include: {
          dataCategory: true,
          organizationElement: true,
          variable: true
        }
      })


      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataEntryNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to update entry',
            message: `Failed to update data entry`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataEntryUpdateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to update data entry',
          message: err.message
        }
      }
    }
  }

  /**
   * Delete new data entry
   * @param event
   * @param id
   * @returns
   */
  async deleteEntry(
    id: z.infer<typeof EntryIdSchema>,
  ): Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataEntry.delete({
        where: { id },
        include: {
          dataCategory: true,
          organizationElement: true,
          variable: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataEntryNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to delete entry',
            message: `Failed to delete data entry`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataEntryDeleteError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to delete data entry',
          message: err.message
        }
      }
    }
  }
}
