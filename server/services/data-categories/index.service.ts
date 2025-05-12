import { H3Event } from 'h3'
import { createError } from 'h3'
import { CreateDataCategorySchema, UpdateDataCategorySchema, DataCategoryIdSchema, DataCategoryQuerySchema } from '~/server/schemas/data-categories.schema'
import type { DataCategory } from '@prisma/client'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'
import { ErrorWithStatus } from '~/types'


interface DataCategoryService {
  getDataCategories : (query: z.infer< typeof DataCategoryQuerySchema>) => Promise<{ data: DataCategory[] | null, error: ErrorWithStatus | null }>;
  getDataCategoryById : (id: z.infer< typeof DataCategoryIdSchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  createDataCategory : (input: z.infer<typeof CreateDataCategorySchema>) =>  Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  updateDataCategory : (id: z.infer<typeof DataCategoryIdSchema>, input: z.infer<typeof UpdateDataCategorySchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  deleteDataCategory: (id: z.infer<typeof DataCategoryIdSchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>
}

export class DataCategoryServices implements DataCategoryService {
  /**
   * Get a data category by ID
   * @param id
   * @returns
   */
  async getDataCategoryById(id: z.infer<typeof DataCategoryIdSchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataCategory.findUnique({
        where: { id }
      });

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataCategoryNotFoundError',
            statusCode: 404,
            statusMessage: 'Data category not found',
            message: `No data category found with ID ${id}`
          }
        };
      }

      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to fetch data category by ID' })
      };
    }
  }



  /**
   * Get all data categories
   * @param query
   * @returns
   */
  async getDataCategories (query: z.infer<typeof DataCategoryQuerySchema>): Promise<{ data: DataCategory[] | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataCategory.findMany()

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataCategoryNotFoundError',
            statusCode: 404,
            statusMessage: 'Data entry not found',
            message: `No data entry found`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to fetch data categories' })
      }
    }
  }

  /**
   * Create a new data category
   * @param event
   * @param input
   * @returns
   */
  async createDataCategory (input: z.infer<typeof CreateDataCategorySchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataCategory.create({
        data: input
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataCategoryFailedToCreate',
            statusCode: 404,
            statusMessage: 'Data entry not found',
            message: `No data entry found`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to create data category' })
      }
    }
  }

  /**
   * Update a data category
   * @param id
   * @param input
   * @returns
   */
  async updateDataCategory (id: z.infer<typeof DataCategoryIdSchema>, input: z.infer<typeof UpdateDataCategorySchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataCategory.update({
        where: { id },
        data: input
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataCategoryFailedToUpdate',
            statusCode: 404,
            statusMessage: 'Data category failed to update',
            message: `Data category failed to update`
          }
        };
      }

      return { data, error: null }

    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to update data category' })
      }
    }
  }


  /**
   * Delete a data category
   * @param event
   * @param id
   * @returns
   */
  async deleteDataCategory (id: z.infer<typeof DataCategoryIdSchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }>  {

    try {
      const data = await prisma.dataCategory.delete({
        where: { id }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataCategoryFailedToDelete',
            statusCode: 404,
            statusMessage: 'Data category failed to delete',
            message: `Data category failed to delete`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to delete data category' })
      }
    }
  }
}
