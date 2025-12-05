import { PrismaClient } from '@prisma/client'

/**
 * @deprecated This file is deprecated. The application now uses Supabase for database operations.
 * Please use the Supabase client from '@/lib/supabase' instead.
 * 
 * This file is kept for backward compatibility and type definitions only.
 * Prisma is no longer used for database operations in production.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Export a null db object to prevent import errors
// All database operations should use Supabase client instead
export const db = null as any

if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  Prisma client (db) is deprecated. Use Supabase client from @/lib/supabase instead.')
}