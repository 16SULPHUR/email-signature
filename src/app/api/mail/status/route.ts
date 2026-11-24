import { getPool } from '@/lib/server/db'
import { requireUser } from '@/lib/server/account'
import { MAIL_LIMITS, googleMailEnabled } from '@/lib/server/mail'

export async function GET() {
  const { user, error } = await requireUser()
  if (error) return error
  const pool = await getPool()
  const { rows } = await pool.query('select email from mail_connections where user_id = $1', [
    user.id,
  ])
  return Response.json({
    available: googleMailEnabled(),
    email: rows[0]?.email ?? null,
    limits: MAIL_LIMITS,
  })
}
