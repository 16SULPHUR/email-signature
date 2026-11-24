import { requireUser } from '@/lib/server/account'
import { MAIL_LIMITS, loadSignatureHtml, sanitizeHtml, wrapBody } from '@/lib/server/mail'

export async function POST(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const input = await req.json().catch(() => ({}))
  const safe = sanitizeHtml(String(input.html || '').slice(0, MAIL_LIMITS.htmlChars))
  const signatureId = input.signatureId ? Number(input.signatureId) : null
  let signature = ''
  if (signatureId) {
    const html = await loadSignatureHtml(user.id, signatureId)
    if (html === null)
      return Response.json({ error: 'That signature is no longer available' }, { status: 400 })
    signature = html
  }
  return Response.json({ html: `${wrapBody(safe)}${signature ? `<br>${signature}` : ''}` })
}
