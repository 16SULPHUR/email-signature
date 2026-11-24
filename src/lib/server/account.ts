import { getPool } from '@/lib/server/db'
import { currentUser } from '@/lib/server/tracking'

export const requireUser = async () => {
  const user = await currentUser()
  return user ? { user, error: null } : { user: null, error: Response.json({ error: 'Log in first' }, { status: 401 }) }
}

export const imageExt = (mime: string) => (mime === 'image/png' ? 'png' : mime === 'image/gif' ? 'gif' : 'jpg')

export async function accountSummary(userId: number | string) {
  const pool = await getPool()
  const { rows } = await pool.query(
    `select
      (select count(*) from signatures where owner_id = $1)::int as signatures,
      (select count(*) from signature_images where owner_id = $1)::int as uploads,
      (select coalesce(sum(size), 0) from signature_images where owner_id = $1)::int as upload_bytes,
      (select count(*) from tracked_emails where user_id = $1)::int as tracked,
      (select coalesce(sum(open_count), 0) from tracked_emails where user_id = $1)::int as opens,
      (select count(*) from submissions where user_id = $1)::int as entries`,
    [userId],
  )
  return rows[0] as {
    signatures: number
    uploads: number
    upload_bytes: number
    tracked: number
    opens: number
    entries: number
  }
}

export const CATEGORIES = ['signatures', 'uploads', 'tracking', 'entries'] as const
export type Category = (typeof CATEGORIES)[number]

const DELETE_SQL: Record<Category, string> = {
  signatures: 'delete from signatures where owner_id = $1',
  uploads: 'delete from signature_images where owner_id = $1',
  tracking: 'delete from tracked_emails where user_id = $1',
  entries: 'delete from submissions where user_id = $1',
}

export async function deleteCategory(userId: number | string, category: Category) {
  const pool = await getPool()
  const res = await pool.query(DELETE_SQL[category], [userId])
  return res.rowCount ?? 0
}
