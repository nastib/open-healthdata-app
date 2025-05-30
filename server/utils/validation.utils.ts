import { z } from 'zod'
import { H3Event } from 'h3'

export async function validateBody<T extends z.ZodType>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: result.error.flatten()
    })
  }

  return result.data
}

export async function validateIdParam(event: H3Event): Promise<number> {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required'
    })
  }
  return Number(id)
}

export async function validateQuery<T extends z.ZodType>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: result.error.flatten()
    })
  }

  return result.data
}
