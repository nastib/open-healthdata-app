import type { H3Event } from 'h3'
import prisma from '~/server/utils/prisma'
import type { DataEntry } from '@prisma/client'
import type { ErrorWithStatus } from '@/types/index'
import { z } from 'zod'
import {
  CreateDataEntrySchema,
  UpdateDataEntrySchema,
  DataEntryIdSchema
} from '~/server/schemas/data-entries'

export class DataEntryServices {
  // Get all data entries
  static async getDataEntries(
    event: H3Event
  ): Promise<{ data: DataEntry[] | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataEntry.findMany({
        include: {
          DataCategory: true,
          organizationElement: true,
          profile: true,
          variable: true
        }
      })
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

  // Create new data entry
  static async createDataEntry(
    event: H3Event,
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
  static async updateDataEntry(
    event: H3Event,
    id: number,
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

  // Delete data entry
  static async deleteDataEntry(
    event: H3Event,
    id: number
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
