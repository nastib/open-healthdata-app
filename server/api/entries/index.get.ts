import { defineEventHandler, getQuery } from 'h3'
import { EntryServices } from '~/server/services/entries/index.service'
import { EntryQuerySchema } from '~/server/schemas/entries.schema'
import type { ErrorWithStatus } from '@/types/index'
import { useRateLimiter, useCache, EntriesPermissions, AuthServer } from '@/server/utils'
import {  } from '@/server/utils'

const MAX_LIMIT = 100
const CACHE_TTL = 60 * 5 // 5 minutes

export default defineEventHandler(async (event) => {
  // Apply rate limiting
  await useRateLimiter(event, { max: MAX_LIMIT, windowMs: 60 * 1000 })

  const { fetchEntries } = new EntryServices()
  const { getAuthenticatedUserFromJWT } = new AuthServer()
  const entriesPermissions = new EntriesPermissions()
  const cache = useCache()

  try {
    // Check user role
    const user = await getAuthenticatedUserFromJWT(event)

    if (!await entriesPermissions.canViewAll(user.profile)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Insufficient permissions to view all data entries',
        data: user.profile.roles.map((role) => role.code).join(', ')
      }) as ErrorWithStatus
    }

    const rawQuery = getQuery(event)
    const query = {
      ...rawQuery,
      limit: rawQuery.limit ? Number(rawQuery.limit) : undefined,
      offset: rawQuery.offset ? Number(rawQuery.offset) : undefined,
      sort: rawQuery.sort
    }

    // Validate query params
    const validation = EntryQuerySchema.safeParse(query)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.format()
      }) as ErrorWithStatus
    }

    // Generate cache key
    const cacheKey = `entries:${JSON.stringify(validation.data)}`

    // Try to get from cache first
    const cached = await cache.get(cacheKey)

    if (cached) {
      return cached
    }

    // Get total count for pagination
    const totalCount = await prisma.dataCategory.count()

    // Get data entries
    const { data, error } = await fetchEntries(validation.data)

    if (!data && error) {
      throw createError({
        statusCode: (error as ErrorWithStatus).statusCode || 404,
        statusMessage: (error as ErrorWithStatus).statusMessage + ' - ' + error.message || 'Not found Error',
        data: error
      }) as ErrorWithStatus
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
    }) as ErrorWithStatus
  }
})
