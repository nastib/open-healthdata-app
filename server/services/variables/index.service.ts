import prisma from '~/server/utils/prisma'
import type { ErrorWithStatus } from '~/types'
import { z } from 'zod'
import type { Variable, Prisma } from '@prisma/client'
import {
  CreateVariableSchema,
  UpdateVariableSchema,
  VariableIdSchema,
  VariableQuerySchema
} from '~/server/schemas/variables.schema'

interface VariableService {
  fetchVariables: (query: z.infer<typeof VariableQuerySchema>) => Promise<{ data: Variable[] | null, error: ErrorWithStatus | null }>
  fetchVariableById: (id: z.infer<typeof VariableIdSchema>) => Promise<{ data: Variable | null, error: ErrorWithStatus | null }>
  createVariable: (input: z.infer<typeof CreateVariableSchema>) => Promise<{ data: Variable | null, error: ErrorWithStatus | null }>
  updateVariable: (id: z.infer<typeof VariableIdSchema>, input: z.infer<typeof UpdateVariableSchema>) => Promise<{ data: Variable | null, error: ErrorWithStatus | null }>
  deleteVariable: (id: z.infer<typeof VariableIdSchema>) => Promise<{ data: Variable | null, error: ErrorWithStatus | null }>
}

export class VariableServices implements VariableService {
  /**
   * Get variable by ID
   * @param id
   * @returns Variable with related data or error
   */
  async fetchVariableById(
    id: z.infer<typeof VariableIdSchema>
  ): Promise<{ data: Variable | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.variable.findUnique({
        where: { id },
        include: {
          dataCategory: true,
          dataSource: true,
          dataEntries: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'VariableNotFoundError',
            statusCode: 404,
            statusMessage: 'Variable not found',
            message: `No variable found with ID: ${id}`
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'VariableServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch variable by ID',
          message: err.message
        }
      }
    }
  }

  /**
   * Get all variables with pagination and filtering
   * @param query
   * @returns List of variables or error
   */
  async fetchVariables(
    query: z.infer<typeof VariableQuerySchema>
  ): Promise<{ data: Variable[] | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.variable.findMany({
        where: {
          code: query.search ? { contains: query.search } : undefined
        },
        take: query.limit,
        skip: query.offset,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          dataCategory: true,
          dataSource: true
        }
      })

      if (!data || data.length === 0) {
        return {
          data: null,
          error: {
            name: 'VariablesNotFoundError',
            statusCode: 404,
            statusMessage: 'Variables not found',
            message: 'No variables found matching criteria'
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'VariableServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch variables',
          message: err.message
        }
      }
    }
  }

  /**
   * Create new variable
   * @param input
   * @returns Created variable or error
   */
  async createVariable(
    input: z.infer<typeof CreateVariableSchema>
  ): Promise<{ data: Variable | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.variable.create({
        data: {
          code: input.code,
          designation: input.designation,
          dataSourceId: input.dataSourceId,
          categoryCode: input.categoryCode,
          frequency: input.frequency,
          level: input.level,
          type: (input.type ?? []) as Prisma.JsonArray,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          dataCategory: true,
          dataSource: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'VariableCreateError',
            statusCode: 500,
            statusMessage: 'Failed to create variable',
            message: 'Database operation failed'
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'VariableCreateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to create variable',
          message: err.message
        }
      }
    }
  }

  /**
   * Update existing variable
   * @param id
   * @param input
   * @returns Updated variable or error
   */
  async updateVariable(
    id: z.infer<typeof VariableIdSchema>,
    input: z.infer<typeof UpdateVariableSchema>
  ): Promise<{ data: Variable | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.variable.update({
        where: { id },
        data: {
          code: input.code,
          designation: input.designation,
          dataSourceId: input.dataSourceId,
          categoryCode: input.categoryCode,
          frequency: input.frequency,
          level: input.level,
          type: (input.type ?? []) as Prisma.JsonArray,
          updatedAt: new Date()
        },
        include: {
          dataCategory: true,
          dataSource: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'VariableUpdateError',
            statusCode: 404,
            statusMessage: 'Failed to update variable',
            message: `Variable with ID ${id} not found`
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'VariableUpdateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to update variable',
          message: err.message
        }
      }
    }
  }

  /**
   * Delete variable
   * @param id
   * @returns Deleted variable or error
   */
  async deleteVariable(
    id: z.infer<typeof VariableIdSchema>
  ): Promise<{ data: Variable | null, error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.variable.delete({
        where: { id },
        include: {
          dataCategory: true,
          dataSource: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'VariableDeleteError',
            statusCode: 404,
            statusMessage: 'Failed to delete variable',
            message: `Variable with ID ${id} not found`
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'VariableDeleteError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to delete variable',
          message: err.message
        }
      }
    }
  }
}
