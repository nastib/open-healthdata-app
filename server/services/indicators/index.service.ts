import prisma from '@/server/utils/prisma'
import type { ErrorWithStatus } from '@/types/index'
import type { Indicator } from '@prisma/client'
import {
  CreateIndicatorSchema,
  UpdateIndicatorSchema,
  IndicatorIdSchema,
  IndicatorQuerySchema,
} from '@/server/schemas/indicators.schema'
import type { z } from 'zod'

interface IndicatorService {
  fetchIndicators: (query: z.infer<typeof IndicatorQuerySchema>) => Promise<{
    data: Indicator[] | null
    error: ErrorWithStatus | null
  }>
  fetchIndicatorById: (id: z.infer<typeof IndicatorIdSchema>) => Promise<{
    data: Indicator | null
    error: ErrorWithStatus | null
  }>
  createIndicator: (input: z.infer<typeof CreateIndicatorSchema>) => Promise<{
    data: Indicator | null
    error: ErrorWithStatus | null
  }>
  updateIndicator: (
    id: z.infer<typeof IndicatorIdSchema>,
    input: z.infer<typeof UpdateIndicatorSchema>
  ) => Promise<{
    data: Indicator | null
    error: ErrorWithStatus | null
  }>
  deleteIndicator: (id: z.infer<typeof IndicatorIdSchema>) => Promise<{
    data: Indicator | null
    error: ErrorWithStatus | null
  }>
}

export class IndicatorServices implements IndicatorService {
  /**
   * Get all indicators
   * @param query - Query parameters for filtering indicators
   * @returns Promise with indicators data or error
   */
  async fetchIndicators(
    query: z.infer<typeof IndicatorQuerySchema>
  ): Promise<{ data: Indicator[] | null; error: ErrorWithStatus | null }> {
    try {
      console.log(query);

      const data = await prisma.indicator.findMany({
        // where: {
        //   categoryCode: query.search ? { contains: query.search } : undefined
        // },
        take: query.limit,
        skip: query.offset,
        orderBy: {
          createdAt: query.sort === 'asc' ? 'asc' : 'desc'
        },
        include: {
          dataCategory: true
        }
      })


      if (!data) {
        return {
          data: null,
          error: {
            name: 'IndicatorNotFoundError',
            statusCode: 404,
            statusMessage: 'Indicators not found',
            message: 'No indicators found matching query'
          }
        }
      }

      return {
        data: data,
        error: null
      }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'IndicatorServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch indicators',
          message: err.message
        }
      }
    }
  }

  /**
   * Get indicator by ID
   * @param id - Indicator ID
   * @returns Promise with indicator data or error
   */
  async fetchIndicatorById(
    id: z.infer<typeof IndicatorIdSchema>
  ): Promise<{ data: Indicator | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.indicator.findUnique({
        where: { id },
        include: {
          dataCategory: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'IndicatorNotFoundError',
            statusCode: 404,
            statusMessage: 'Indicator not found',
            message: `No indicator found with ID: ${id}`
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'IndicatorServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch indicator',
          message: err.message
        }
      }
    }
  }

  /**
   * Create new indicator
   * @param input - Indicator data
   * @returns Promise with created indicator or error
   */
  async createIndicator(
    input: z.infer<typeof CreateIndicatorSchema>
  ): Promise<{ data: Indicator | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.indicator.create({
        data: {
          ...input
        },
        include: {
          dataCategory: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'IndicatorNotFoundError',
            statusCode: 404,
            statusMessage: 'Indicators not found',
            message: 'No indicators found matching query'
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'IndicatorCreateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to create indicator',
          message: err.message
        }
      }
    }
  }

  /**
   * Update existing indicator
   * @param id - Indicator ID
   * @param input - Updated indicator data
   * @returns Promise with updated indicator or error
   */
  async updateIndicator(
    id: z.infer<typeof IndicatorIdSchema>,
    input: z.infer<typeof UpdateIndicatorSchema>
  ): Promise<{ data: Indicator | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.indicator.update({
        where: { id },
        data: {
          ...input
        },
        include: {
          dataCategory: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'IndicatorNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to update indicator',
            message: 'Failed to update indicator'
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'IndicatorUpdateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to update indicator',
          message: err.message
        }
      }
    }
  }

  /**
   * Delete indicator
   * @param id - Indicator ID
   * @returns Promise with deleted indicator or error
   */
  async deleteIndicator(
    id: z.infer<typeof IndicatorIdSchema>
  ): Promise<{ data: Indicator | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.indicator.delete({
        where: { id },
        include: {
          dataCategory: true
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'IndicatorNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to delete indicator',
            message: 'Failed to delete indicator'
          }
        }
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'IndicatorDeleteError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to delete indicator',
          message: err.message
        }
      }
    }
  }
}
