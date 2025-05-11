import { H3Event } from 'h3'
import { createError } from 'h3'
import { CreateDataCategorySchema, UpdateDataCategorySchema, DataCategoryIdSchema } from '~/server/schemas/data-categories'
import type { DataCategory } from '@prisma/client'
import prisma from '~/server/utils/prisma'

export const DataCategoryServices = {
  /**
   * Get all data categories
   */
  getDataCategories: async (event: H3Event): Promise<{ data: DataCategory[] | null; error: Error | null }> => {
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_VIEWER')) {
      return {
        data: null,
        error: createError({ statusCode: 403, message: 'Forbidden - Insufficient permissions' })
      }
    }

    try {
      const categories = await prisma.dataCategory.findMany()
      return { data: categories, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to fetch data categories' })
      }
    }
  },

  /**
   * Create a new data category
   */
  createDataCategory: async (event: H3Event, input: unknown): Promise<{ data: DataCategory | null; error: Error | null }> => {
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_EDITOR')) {
      return {
        data: null,
        error: createError({ statusCode: 403, message: 'Forbidden - Insufficient permissions' })
      }
    }

    const validation = CreateDataCategorySchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Validation Error',
          data: validation.error.format()
        })
      }
    }

    try {
      const newCategory = await prisma.dataCategory.create({
        data: validation.data
      })
      return { data: newCategory, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to create data category' })
      }
    }
  },

  /**
   * Update a data category
   */
  updateDataCategory: async (event: H3Event, id: number, input: unknown): Promise<{ data: DataCategory | null; error: Error | null }> => {
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_EDITOR')) {
      return {
        data: null,
        error: createError({ statusCode: 403, message: 'Forbidden - Insufficient permissions' })
      }
    }

    const idValidation = DataCategoryIdSchema.safeParse(id)
    if (!idValidation.success) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Invalid ID format'
        })
      }
    }

    const dataValidation = UpdateDataCategorySchema.safeParse(input)
    if (!dataValidation.success) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Validation Error',
          data: dataValidation.error.format()
        })
      }
    }

    try {
      const updatedCategory = await prisma.dataCategory.update({
        where: { id },
        data: dataValidation.data
      })
      return { data: updatedCategory, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to update data category' })
      }
    }
  },

  /**
   * Delete a data category
   */
  deleteDataCategory: async (event: H3Event, id: number): Promise<{ data: DataCategory | null; error: Error | null }> => {
    const user = await getAuthenticatedUser(event)
    if (!user.hasRole('DATA_DELETE')) {
      return {
        data: null,
        error: createError({ statusCode: 403, message: 'Forbidden - Insufficient permissions' })
      }
    }

    const validation = DataCategoryIdSchema.safeParse(id)
    if (!validation.success) {
      return {
        data: null,
        error: createError({
          statusCode: 400,
          message: 'Invalid ID format'
        })
      }
    }

    try {
      const deletedCategory = await prisma.dataCategory.delete({
        where: { id }
      })
      return { data: deletedCategory, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to delete data category' })
      }
    }
  }
}
