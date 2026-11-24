import { CATEGORIES, deleteCategory, requireUser } from '@/lib/server/account'
import { getPayloadClient } from '@/lib/server/db'

export async function POST(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const body = await req.json().catch(() => ({}))
  if (String(body.confirm || '').trim().toLowerCase() !== user.email.toLowerCase())
    return Response.json({ error: 'Type your email address to confirm' }, { status: 400 })

  for (const category of CATEGORIES) await deleteCategory(user.id, category)
  const payload = await getPayloadClient()
  await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
  return Response.json({ ok: true })
}
