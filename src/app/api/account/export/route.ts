import { getPool } from '@/lib/server/db'
import { imageExt, requireUser } from '@/lib/server/account'

export async function GET(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const pool = await getPool()
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '')
  const q = <T>(sql: string) => pool.query(sql, [user.id]).then((r) => r.rows as T[])

  const [signatures, uploads, entries, tracked, opens] = await Promise.all([
    q<{ name: string; template: string; data: unknown; created_at: string; updated_at: string }>(
      'select name, template, data, created_at, updated_at from signatures where owner_id = $1 order by updated_at desc',
    ),
    q<{ id: string; mime: string; size: number; kind: string; created_at: string }>(
      'select id, mime, size, kind, created_at from signature_images where owner_id = $1 order by created_at desc',
    ),
    q(
      'select name, email, template, copied, data, created_at, updated_at from submissions where user_id = $1 order by updated_at desc',
    ),
    q(
      `select id, subject, recipient_name, recipient_email, open_count, first_opened_at, last_opened_at, created_at
       from tracked_emails where user_id = $1 order by created_at desc`,
    ),
    q(
      `select o.tracked_id, o.opened_at, o.kind, o.device, o.country, o.city
       from email_opens o join tracked_emails t on t.id = o.tracked_id where t.user_id = $1 order by o.opened_at desc`,
    ),
  ])

  const body = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, name: user.name || null, createdAt: user.createdAt },
    savedSignatures: signatures,
    uploadedImages: uploads.map((u) => ({ ...u, url: `${base}/img/${u.id}.${imageExt(u.mime)}` })),
    editorEntries: entries,
    trackedEmails: tracked.map((t) => ({
      ...(t as object),
      opens: opens.filter((o) => (o as { tracked_id: string }).tracked_id === (t as { id: string }).id),
    })),
  }
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="sigrio-account-data.json"',
      'Cache-Control': 'no-store',
    },
  })
}
