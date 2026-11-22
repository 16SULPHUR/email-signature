import config from '@payload-config'
import type { Pool } from 'pg'
import { getPayload } from 'payload'

export async function getPool(): Promise<Pool> {
  const payload = await getPayload({ config })
  return (payload.db as unknown as { pool: Pool }).pool
}

export async function getPayloadClient() {
  return getPayload({ config })
}
