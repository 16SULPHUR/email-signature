import { getPool } from '@/lib/server/db'
import { currentUser } from '@/lib/server/tracking'

type Ctx = { params: Promise<{ id: string }> }

async function owned(id: string) {
  const user = await currentUser()
  if (!user) return { error: Response.json({ error: 'Log in first' }, { status: 401 }) }
  if (!/^[\w-]{8,16}$/.test(id)) return { error: Response.json({ error: 'Not found' }, { status: 404 }) }
  return { user, pool: await getPool() }
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  const ctx = await owned(id)
  if (ctx.error) return ctx.error
  const { rows } = await ctx.pool.query(
    `select id, subject, recipient_name, recipient_email, open_count, first_opened_at, last_opened_at, created_at
     from tracked_emails where id = $1 and user_id = $2`,
    [id, ctx.user.id],
  )
  if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })
  const opens = await ctx.pool.query(
    `select opened_at, kind, device, country, city from email_opens
     where tracked_id = $1 order by opened_at desc limit 200`,
    [id],
  )
  return Response.json({ ...rows[0], opens: opens.rows })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params
  const ctx = await owned(id)
  if (ctx.error) return ctx.error
  await ctx.pool.query('delete from tracked_emails where id = $1 and user_id = $2', [id, ctx.user.id])
  return Response.json({ ok: true })
}
