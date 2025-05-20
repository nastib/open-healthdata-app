import { CreateCategorySchema, UpdateCategorySchema, CategoryIdSchema, CategoryQuerySchema } from '@/server/schemas/categories.schema'
import type { DataCategory } from '@prisma/client'
import prisma from '@/server/utils/prisma'
import { z } from 'zod'
import { ErrorWithStatus } from '@/types'


interface CategoryService {
  fetchCategories : (query: z.infer< typeof CategoryQuerySchema>) => Promise<{ data: DataCategory[] | null, error: ErrorWithStatus | null }>;
  fetchCategoryById : (id: z.infer< typeof CategoryIdSchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  createCategory : (input: z.infer<typeof CreateCategorySchema>) =>  Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  updateCategory : (id: z.infer<typeof CategoryIdSchema>, input: z.infer<typeof UpdateCategorySchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>;
  deleteCategory: (id: z.infer<typeof CategoryIdSchema>) => Promise<{ data: DataCategory | null, error: ErrorWithStatus | null }>
}

export class CategoryServices implements CategoryService {
  /**
   * Get a data category by ID
   * @param id
   * @returns
   */
  async fetchCategoryById(id: z.infer<typeof CategoryIdSchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {
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
  async fetchCategories (query: z.infer<typeof CategoryQuerySchema>): Promise<{ data: DataCategory[] | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.dataCategory.findMany({
        take: query.limit,
        skip: query.offset,
        orderBy: {
          id: query.sort === 'asc' ? 'asc' : 'desc'
        }
      })

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
  async createCategory (input: z.infer<typeof CreateCategorySchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {

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
  async updateCategory (id: z.infer<typeof CategoryIdSchema>, input: z.infer<typeof UpdateCategorySchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }> {

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
  async deleteCategory (id: z.infer<typeof CategoryIdSchema>): Promise<{ data: DataCategory | null; error: ErrorWithStatus | null }>  {

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
