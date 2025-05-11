import { z } from 'zod'

/**
 * Creates a standardized error schema
 * @param statusCode HTTP status code
 * @param statusMessage Short status message
 * @param description Detailed error description
 * @returns Zod schema for error response
 */
export function createErrorSchema(statusCode: number, statusMessage: string, description: string) {
  return z.object({
    statusCode: z.literal(statusCode),
    statusMessage: z.literal(statusMessage),
    description: z.literal(description),
    timestamp: z.string().datetime(),
    path: z.string().optional()
  })
}

// Common error schemas
export const ErrorSchemas = {
  400: createErrorSchema(400, 'Bad Request', 'Invalid request data'),
  401: createErrorSchema(401, 'Unauthorized', 'Authentication required'),
  403: createErrorSchema(403, 'Forbidden', 'Insufficient permissions'),
  404: createErrorSchema(404, 'Not Found', 'Resource not found'),
  500: createErrorSchema(500, 'Internal Server Error', 'Unexpected server error')
}
