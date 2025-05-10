// Server-only crypto utilities
import { createHash } from 'node:crypto'

export const hashString = async (input: string): Promise<string> => {
  if (process.client) {
    throw new Error('hashString cannot be used on client side')
  }
  return createHash('sha256').update(input).digest('hex')
}

// Type exports for server-side usage
export type { Hash } from 'node:crypto'
