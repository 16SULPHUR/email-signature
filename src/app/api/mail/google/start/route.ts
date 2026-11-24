import crypto from 'node:crypto'

import { googleAuthUrl, googleMailEnabled, siteOrigin } from '@/lib/server/mail'
import { currentUser } from '@/lib/server/tracking'

export async function GET() {
  const user = await currentUser()
  if (!user) return Response.redirect(`${siteOrigin()}/login`, 302)
  if (!googleMailEnabled())
    return Response.redirect(`${siteOrigin()}/compose?mail=unavailable`, 302)
  const state = crypto.randomBytes(16).toString('base64url')
  const res = new Response(null, { status: 302, headers: { Location: googleAuthUrl(state) } })
  res.headers.append(
    'Set-Cookie',
    `mail_state=${state}; Path=/api/mail; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
  )
  return res
}
