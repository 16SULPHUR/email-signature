import { getPool } from '@/lib/server/db'
import { imageExt, requireUser } from '@/lib/server/account'

export async function GET(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const pool = await getPool()
  const { rows } = await pool.query(
    'select id, mime, size, kind, created_at from signature_images where owner_id = $1 order by created_at desc',
    [user.id],
  )
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '')
  return Response.json({
    docs: rows.map((r) => ({ ...r, url: `${base}/img/${r.id}.${imageExt(r.mime)}` })),
  })
}

export async function DELETE(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const id = new URL(req.url).searchParams.get('id') || ''
  const pool = await getPool()
  await pool.query('delete from signature_images where id = $1 and owner_id = $2', [id, user.id])
  return Response.json({ ok: true })
}
