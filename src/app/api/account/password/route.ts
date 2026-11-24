import { getPayloadClient } from '@/lib/server/db'
import { requireUser } from '@/lib/server/account'

export async function POST(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const body = await req.json().catch(() => ({}))
  const current = String(body.current || '')
  const next = String(body.next || '')
  if (next.length < 8) return Response.json({ error: 'New password must be at least 8 characters' }, { status: 400 })

  const payload = await getPayloadClient()
  try {
    await payload.login({ collection: 'users', data: { email: user.email, password: current } })
  } catch {
    return Response.json({ error: 'Current password is wrong' }, { status: 400 })
  }
  await payload.update({ collection: 'users', id: user.id, data: { password: next }, overrideAccess: true })
  return Response.json({ ok: true })
}
