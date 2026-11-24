import { requireUser } from '@/lib/server/account'
import { MAIL_LIMITS, bodyToHtml, loadSignatureHtml } from '@/lib/server/mail'

export async function POST(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const input = await req.json().catch(() => ({}))
  const text = String(input.body || '').slice(0, MAIL_LIMITS.bodyChars)
  const signatureId = input.signatureId ? Number(input.signatureId) : null
  let signature = ''
  if (signatureId) {
    const html = await loadSignatureHtml(user.id, signatureId)
    if (html === null)
      return Response.json({ error: 'That signature is no longer available' }, { status: 400 })
    signature = html
  }
  return Response.json({ html: `${bodyToHtml(text)}${signature ? `<br>${signature}` : ''}` })
}
