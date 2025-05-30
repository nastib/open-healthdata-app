import { defineEventHandler, getQuery, createError } from 'h3'
import { OrganizationServices } from '~/server/services/organizations/index.service'
import { OrganizationQuerySchema } from '~/server/schemas/organizations.schemas'
import type { ErrorWithStatus } from '~/types'
import { useRateLimiter, useCache, AuthServer } from '~/server/utils'
import prisma from '~/server/utils/prisma'
import { OrganizationsPermissions } from '~/server/utils/permissions/organizations.permissions'

const MAX_LIMIT = 100
const CACHE_TTL = 60 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  await useRateLimiter(event, { max: 100, windowMs: 60 * 1000 })

  const { fetchOrganizations } = new OrganizationServices()
  const { getAuthenticatedUserFromJWT } = new AuthServer()
  const organizationsPermissions = new OrganizationsPermissions()
  const cache = useCache()

  try {
    // Check user role
    const user = await getAuthenticatedUserFromJWT(event)

    if (!await organizationsPermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to fetch all organizations'
      })
    }

    // Validate query params
    const rawQuery = getQuery(event)
    const query = {
      ...rawQuery,
      limit: rawQuery.limit ? Math.min(Number(rawQuery.limit), MAX_LIMIT) : MAX_LIMIT,
      offset: rawQuery.offset ? Number(rawQuery.offset) : 0,
      sort: rawQuery.sort || 'asc'
    }

    const validation = OrganizationQuerySchema.safeParse(query)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    // Generate cache key
    const cacheKey = `organizations:${JSON.stringify(validation.data)}`

    // Try to get from cache first
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    // Get total count for pagination
    const totalCount = await prisma.organizationElement.count({
      where: validation.data.search ? {
        OR: [
          { designation: { contains: validation.data.search, mode: 'insensitive' } },
          { code: { contains: validation.data.search, mode: 'insensitive' } },
          { acronym: { contains: validation.data.search, mode: 'insensitive' } }
        ]
      } : undefined
    })

    const { data, error } = await fetchOrganizations(validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage || 'Not found Error',
        data: error
      })
    }

    const result = {
      success: true,
      data: data,
      meta: {
        returned: data?.length || 0,
        total: totalCount,
        limit: validation.data.limit,
        offset: validation.data.offset
      }
    }

    // Cache the result
    await cache.set(cacheKey, result, CACHE_TTL)

    return result
  } catch (error: unknown) {
    const err = error as ErrorWithStatus
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal Server Error',
      data: err.data
    })
  }
})
