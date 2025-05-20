import { defineEventHandler, getQuery } from 'h3'
import { CategoryServices } from '@/server/services/categories/index.service'
import { CategoryQuerySchema } from '@/server/schemas/categories.schema'
import type { ErrorWithStatus } from '@/types/index'
import { CategoriesPermissions,useRateLimiter,useCache, AuthServer} from '@/server/utils'
import prisma from '@/server/utils/prisma'

const MAX_LIMIT = 100
const CACHE_TTL = 60 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  await useRateLimiter(event, { max: 100, windowMs: 60 * 1000 })

  const { fetchCategories } = new CategoryServices()
  const { getAuthenticatedUserFromJWT } = new AuthServer()
  const categoriesPermissions = new CategoriesPermissions()
  const cache = useCache()

  try {
    // Check user role
    const user = await getAuthenticatedUserFromJWT(event)

    if (!await categoriesPermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to fetch all data categories'
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

    const validation = CategoryQuerySchema.safeParse(query)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      })
    }

    // Generate cache key
    const cacheKey = `categories:${JSON.stringify(validation.data)}`

    // Try to get from cache first
    const cached = await cache.get(cacheKey)
    if (cached) return cached

    // Get total count for pagination
    const totalCount = await prisma.dataCategory.count()

    const { data, error } = await fetchCategories(validation.data)

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
