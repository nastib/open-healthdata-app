import { CreateOrganizationSchema, UpdateOrganizationSchema, OrganizationIdSchema, OrganizationQuerySchema } from '~/server/schemas/organizations.schemas'
import type { OrganizationElement } from '@prisma/client'
import prisma from '~/server/utils/prisma'
import { z } from 'zod'
import { ErrorWithStatus } from '~/types'
import { createError } from 'h3'


interface OrganizationService {
  fetchOrganizations : (query: z.infer< typeof OrganizationQuerySchema>) => Promise<{ data: OrganizationElement[] | null, error: ErrorWithStatus | null }>;
  fetchOrganizationById : (id: z.infer< typeof OrganizationIdSchema>) => Promise<{ data: OrganizationElement | null, error: ErrorWithStatus | null }>;
  createOrganization : (input: z.infer<typeof CreateOrganizationSchema>) =>  Promise<{ data: OrganizationElement | null, error: ErrorWithStatus | null }>;
  updateOrganization : (id: z.infer<typeof OrganizationIdSchema>, input: z.infer<typeof UpdateOrganizationSchema>) => Promise<{ data: OrganizationElement | null, error: ErrorWithStatus | null }>;
  deleteOrganization: (id: z.infer<typeof OrganizationIdSchema>) => Promise<{ data: OrganizationElement | null, error: ErrorWithStatus | null }>
}

export class OrganizationServices implements OrganizationService {
  /**
   * Get an organization by ID
   * @param id
   * @returns
   */
  async fetchOrganizationById(id: z.infer<typeof OrganizationIdSchema>): Promise<{ data: OrganizationElement | null; error: ErrorWithStatus | null }> {
    try {
      const data = await prisma.organizationElement.findUnique({
        where: { id }
      })


      if (!data) {
        return {
          data: null,
          error: {
            name: 'OrganizationNotFoundError',
            statusCode: 404,
            statusMessage: 'Organization not found',
            message: `No organization found with ID ${id}`
          }
        };
      }

      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to fetch organization by ID' }) as ErrorWithStatus
      };
    }
  }

  /**
   * Get all organizations
   * @param query
   * @returns
   */
  async fetchOrganizations (query: z.infer<typeof OrganizationQuerySchema>): Promise<{ data: OrganizationElement[] | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.organizationElement.findMany({
        take: query.limit,
        skip: query.offset,
        orderBy: {
          id: query.sort === 'asc' ? 'asc' : 'desc'
        },
        where: query.search ? {
          OR: [
            { designation: { contains: query.search, mode: 'insensitive' } },
            { code: { contains: query.search, mode: 'insensitive' } },
            { acronym: { contains: query.search, mode: 'insensitive' } }
          ]
        } : undefined
      });


      if (!data) {
        return {
          data: null,
          error: {
            name: 'OrganizationNotFoundError',
            statusCode: 404,
            statusMessage: 'Organizations not found',
            message: `No organizations found`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to fetch organizations' }) as ErrorWithStatus
      }
    }
  }

  /**
   * Create a new organization
   * @param input
   * @returns
   */
  async createOrganization (input: z.infer<typeof CreateOrganizationSchema>): Promise<{ data: OrganizationElement | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.organizationElement.create({
        data: input
      });


      if (!data) {
        return {
          data: null,
          error: {
            name: 'OrganizationFailedToCreate',
            statusCode: 404,
            statusMessage: 'Organization failed to create',
            message: `Organization failed to create`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to create organization' }) as ErrorWithStatus
      }
    }
  }

  /**
   * Update an organization
   * @param id
   * @param input
   * @returns
   */
  async updateOrganization (id: z.infer<typeof OrganizationIdSchema>, input: z.infer<typeof UpdateOrganizationSchema>): Promise<{ data: OrganizationElement | null; error: ErrorWithStatus | null }> {

    try {
      const data = await prisma.organizationElement.update({
        where: { id },
        data: input
      });


      if (!data) {
        return {
          data: null,
          error: {
            name: 'OrganizationFailedToUpdate',
            statusCode: 404,
            statusMessage: 'Organization failed to update',
            message: `Organization failed to update`
          }
        };
      }

      return { data, error: null }

    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to update organization' }) as ErrorWithStatus
      }
    }
  }

  /**
   * Delete an organization
   * @param id
   * @returns
   */
  async deleteOrganization (id: z.infer<typeof OrganizationIdSchema>): Promise<{ data: OrganizationElement | null; error: ErrorWithStatus | null }>  {

    try {
      const data = await prisma.organizationElement.delete({
        where: { id }
      })

      if (!data) {
        return {
          data: null,
          error: {
            name: 'OrganizationFailedToDelete',
            statusCode: 404,
            statusMessage: 'Organization failed to delete',
            message: `Organization failed to delete`
          }
        };
      }

      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: createError({ statusCode: 500, message: 'Failed to delete organization' }) as ErrorWithStatus
      }
    }
  }
}
