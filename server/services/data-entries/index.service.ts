import type { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import type { DataEntry } from '@prisma/client'
import type { ErrorWithStatus } from '@/types/index'
import { z } from 'zod'
import {
  CreateDataEntrySchema,
  UpdateDataEntrySchema,
  DataEntryIdSchema,
  DataEntryQuerySchema
} from '~/server/schemas/data-entries.schema'

interface DataEntryService {
   getDataEntries : (query: z.infer< typeof DataEntryQuerySchema>) => Promise<{ data: DataEntry[] | null, error: ErrorWithStatus | null }>;
   getDataEntryById : (id: z.infer< typeof DataEntryIdSchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   createDataEntry : (input: z.infer<typeof CreateDataEntrySchema>) =>  Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   updateDataEntry : (id: z.infer<typeof DataEntryIdSchema>, input: z.infer<typeof UpdateDataEntrySchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>;
   deleteDataEntry: (id: z.infer<typeof DataEntryIdSchema>) => Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }>
}
export class DataEntryServices implements DataEntryService {
  /**
   * Get data entry by ID
   * @param id
   * @returns
   */
  async getDataEntryById(
    id: z.infer<typeof DataEntryIdSchema>
  ): Promise<{ data: DataEntry | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataEntry.findUnique({
        where: { id },
        include: {
          DataCategory: true,
          organizationElement: true,
          variable: true
        }
      });

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
  async getDataEntries(query: z.infer<typeof DataEntryQuerySchema>): Promise<{ data: DataEntry[] | null, error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataEntry.findMany({
        include: {
          DataCategory: true,
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
  async createDataEntry(
    input: z.infer<typeof CreateDataEntrySchema>
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
          DataCategory: true,
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
  async updateDataEntry(
    id: z.infer<typeof DataEntryIdSchema>,
    input: z.infer<typeof UpdateDataEntrySchema>
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
          DataCategory: true,
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
  async deleteDataEntry(
    id: z.infer<typeof DataEntryIdSchema>,
  ): Promise<{ data: DataEntry | null, error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataEntry.delete({
        where: { id },
        include: {
          DataCategory: true,
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
