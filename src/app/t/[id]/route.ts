import crypto from 'node:crypto'
import { after } from 'next/server'

import { getPool } from '@/lib/server/db'
import { TRACKING_LIMITS, classifyOpen } from '@/lib/server/tracking'

const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

async function record(id: string, req: Request) {
  const pool = await getPool()
  const ua = (req.headers.get('user-agent') || '').slice(0, 400)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const ipHash = crypto.createHash('sha256').update(`${ip}:${process.env.PAYLOAD_SECRET}`).digest('hex').slice(0, 32)
  const { kind, device } = classifyOpen(ua)

  const email = await pool.query('select open_count from tracked_emails where id = $1', [id])
  if (!email.rows[0] || email.rows[0].open_count >= TRACKING_LIMITS.opensPerEmail) return

  const dup = await pool.query(
    `select 1 from email_opens where tracked_id = $1 and ip_hash = $2 and device = $3
     and opened_at > now() - interval '30 seconds' limit 1`,
    [id, ipHash, device],
  )
  if (dup.rows[0]) return

  const located = kind === 'open'
  const country = located ? (req.headers.get('x-vercel-ip-country') || '').slice(0, 8) || null : null
  const rawCity = located ? req.headers.get('x-vercel-ip-city') || '' : ''
  const city = rawCity ? decodeURIComponent(rawCity).slice(0, 100) : null

  await pool.query(
    'insert into email_opens (tracked_id, ip_hash, kind, device, country, city) values ($1,$2,$3,$4,$5,$6)',
    [id, ipHash, kind, device, country, city],
  )
  if (kind !== 'bot') {
    await pool.query(
      `update tracked_emails set open_count = open_count + 1,
       first_opened_at = coalesce(first_opened_at, now()), last_opened_at = now() where id = $1`,
      [id],
    )
  }
  if (Math.random() < 0.01) {
    await pool.query(`delete from email_opens where opened_at < now() - ($1 || ' days')::interval`, [
      String(TRACKING_LIMITS.retentionDays),
    ])
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const key = id.replace(/\.gif$/, '')
  if (/^[\w-]{8,16}$/.test(key)) after(() => record(key, req).catch(() => {}))
  return new Response(new Uint8Array(PIXEL), {
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
    },
  })
}
