import { headers as getHeaders } from 'next/headers'

import { getPayloadClient } from '@/lib/server/db'

const MAX_BYTES = 20_000

export async function POST(req: Request) {
  const raw = await req.text()
  if (raw.length > MAX_BYTES) return new Response(null, { status: 413 })
  let body: { visitorId?: string; template?: string; data?: Record<string, unknown>; copied?: boolean }
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }
  const visitorId = String(body.visitorId || '')
  if (!/^[\w-]{16,64}$/.test(visitorId)) return new Response(null, { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  const fields = (body.data?.fields || {}) as Record<string, string>
  const doc = {
    visitorId,
    template: String(body.template || '').slice(0, 64),
    name: String(fields.name || '').slice(0, 200),
    email: String(fields.email || '').slice(0, 200),
    data: body.data,
    ...(body.copied ? { copied: true } : {}),
    ...(user ? { user: user.id } : {}),
  }

  const existing = await payload.find({
    collection: 'submissions',
    where: { visitorId: { equals: visitorId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    await payload.update({ collection: 'submissions', id: existing.docs[0].id, data: doc, overrideAccess: true })
  } else {
    await payload.create({ collection: 'submissions', data: doc, overrideAccess: true })
  }
  return new Response(null, { status: 204 })
}
