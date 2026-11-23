import crypto from 'node:crypto'
import { headers as getHeaders } from 'next/headers'

import { getPool } from '@/lib/server/db'

const MAX_BYTES = 30_000
const PER_HOUR = 20

export async function POST(req: Request) {
  const raw = await req.text()
  if (raw.length > MAX_BYTES) return Response.json({ error: 'Too large' }, { status: 413 })
  let body: { template?: string; data?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 })
  }
  const template = String(body.template || '').slice(0, 64)
  if (!template || !body.data || typeof body.data !== 'object')
    return Response.json({ error: 'Bad request' }, { status: 400 })

  const ip = ((await getHeaders()).get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const ipHash = crypto.createHash('sha256').update(`${ip}:${process.env.PAYLOAD_SECRET}`).digest('hex').slice(0, 32)
  const pool = await getPool()
  const { rows } = await pool.query(
    `select count(*)::int as n from shared_signatures where ip_hash = $1 and created_at > now() - interval '1 hour'`,
    [ipHash],
  )
  if (rows[0].n >= PER_HOUR) return Response.json({ error: 'Too many links, try again later' }, { status: 429 })

  const id = crypto.randomBytes(8).toString('base64url').slice(0, 10)
  await pool.query('insert into shared_signatures (id, template, data, ip_hash) values ($1,$2,$3,$4)', [
    id,
    template,
    JSON.stringify(body.data),
    ipHash,
  ])
  return Response.json({ id })
}
