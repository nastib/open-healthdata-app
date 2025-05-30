import prisma from '@/server/utils/prisma'
import { z } from 'zod';
import type { DataSource } from '@prisma/client'
import type { ErrorWithStatus } from '~/types';
import { SourceQuerySchema, SourceIdSchema, SourceCreateSchema, SourceUpdateSchema } from '@/server/schemas/sources.schema'

interface IDataSourceServices {
  fetchSources(query: z.infer< typeof SourceQuerySchema >): Promise<{ data: DataSource[] | null; error: ErrorWithStatus | null }>
  fetchSourceById(id: z.infer<typeof SourceIdSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }>
  createSource(payload: z.infer<typeof SourceCreateSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }>
  updateSource(id: z.infer<typeof SourceIdSchema>, payload: z.infer<typeof SourceUpdateSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }>
  deleteSource(id: z.infer<typeof SourceIdSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus| null }>
}

export class DataSourceServices implements IDataSourceServices {

  async fetchSources(query: z.infer<typeof SourceQuerySchema >): Promise<{ data: DataSource[] | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataSource.findMany({
        take: query.limit,
        skip: query.offset,
        orderBy: {
          id: query.sort === 'asc' ? 'asc' : 'desc'
        },
      })


      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataSourceNotFoundError',
            statusCode: 404,
            statusMessage: 'Data Source not found',
            message: `No data source found`
          }
        };
      }

      return { data, error: null }
    } catch (error) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataSourceServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch data source',
          message: err.message
        }
      }
    }
  }

  async fetchSourceById(id: z.infer<typeof SourceIdSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataSource.findUnique({
        where: { id }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataSourceNotFoundError',
            statusCode: 404,
            statusMessage: 'Data Source not found',
            message: `No data source found`
          }
        };
      }
      return { data, error: null }
    } catch (error) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataSourceServiceError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to fetch data source',
          message: err.message
        }
      }
    }
  }

  async createSource(payload: z.infer<typeof SourceCreateSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataSource.create({
        data: {
          designation: payload.name,
          type: payload.description
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataSourceNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to create data source',
            message: `Failed to create data source`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataSourceCreateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to create data source',
          message: err.message
        }
      }
    }
  }

  async updateSource(id: z.infer<typeof SourceIdSchema>, payload: z.infer<typeof SourceUpdateSchema>): Promise<{ data: DataSource | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.dataSource.update({
        where: { id },
        data: {
          designation: payload.name,
          type: payload.description
        }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataSourceNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to update source',
            message: `Failed to update data source`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataSourceUpdateError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to update data source',
          message: err.message
        }
      }
    }
  }

  async deleteSource(id: z.infer<typeof SourceIdSchema>):  Promise<{ data: DataSource | null; error: ErrorWithStatus| null }> {
    try {
      const data = await prisma.dataSource.delete({
        where: { id }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'DataSourceNotFoundError',
            statusCode: 404,
            statusMessage: 'Failed to delete source',
            message: `Failed to delete data source`
          }
        };
      }

      return { data, error: null }
    } catch (error: unknown) {
      const err = error as ErrorWithStatus
      return {
        data: null,
        error: {
          name: 'DataSourceDeleteError',
          statusCode: err.statusCode || 500,
          statusMessage: err.statusMessage || 'Failed to delete data source',
          message: err.message
        }
      }
    }
  }
}
