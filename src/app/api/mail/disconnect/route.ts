import { getPool } from '@/lib/server/db'
import { requireUser } from '@/lib/server/account'

export async function POST() {
  const { user, error } = await requireUser()
  if (error) return error
  const pool = await getPool()
  await pool.query('delete from mail_connections where user_id = $1', [user.id])
  return Response.json({ ok: true })
}
