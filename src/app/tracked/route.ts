import crypto from 'node:crypto'

import { getPool } from '@/lib/server/db'
import { TRACKING_LIMITS, currentUser } from '@/lib/server/tracking'

export async function GET() {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Log in first' }, { status: 401 })
  const pool = await getPool()
  const { rows } = await pool.query(
    `select id, subject, recipient_name, recipient_email, open_count, first_opened_at, last_opened_at, created_at
     from tracked_emails where user_id = $1 order by created_at desc limit 200`,
    [user.id],
  )
  return Response.json({ docs: rows })
}

export async function POST(req: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Log in first' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const subject = String(body.subject || '').trim().slice(0, 300)
  const recipientName = String(body.recipientName || '').trim().slice(0, 200)
  const recipientEmail = String(body.recipientEmail || '').trim().slice(0, 200)
  if (!subject) return Response.json({ error: 'Add a subject or note to identify this email' }, { status: 400 })

  const pool = await getPool()
  const { rows } = await pool.query(
    `select count(*)::int as total, count(*) filter (where created_at > now() - interval '1 hour')::int as recent
     from tracked_emails where user_id = $1`,
    [user.id],
  )
  if (rows[0].total >= TRACKING_LIMITS.perUser)
    return Response.json({ error: `You can track up to ${TRACKING_LIMITS.perUser} emails. Delete old ones first.` }, { status: 429 })
  if (rows[0].recent >= TRACKING_LIMITS.perUserPerHour)
    return Response.json({ error: 'Too many tracked emails this hour, try again later' }, { status: 429 })

  const id = crypto.randomBytes(9).toString('base64url')
  await pool.query(
    'insert into tracked_emails (id, user_id, subject, recipient_name, recipient_email) values ($1,$2,$3,$4,$5)',
    [id, user.id, subject, recipientName || null, recipientEmail || null],
  )
  return Response.json({ id })
}
