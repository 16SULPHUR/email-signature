import { getPool } from '@/lib/server/db'
import { exchangeCode, googleMailEnabled, seal, siteOrigin } from '@/lib/server/mail'
import { currentUser } from '@/lib/server/tracking'

const back = (status: string) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: `${siteOrigin()}/compose?mail=${status}`,
      'Set-Cookie': 'mail_state=; Path=/api/mail; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    },
  })

export async function GET(req: Request) {
  const user = await currentUser()
  if (!user) return Response.redirect(`${siteOrigin()}/login`, 302)
  if (!googleMailEnabled()) return back('unavailable')
  const url = new URL(req.url)
  const state = url.searchParams.get('state') || ''
  const cookie = /(?:^|;\s*)mail_state=([^;]+)/.exec(req.headers.get('cookie') || '')?.[1]
  const code = url.searchParams.get('code')
  if (!code || !state || state !== cookie) return back('denied')

  const result = await exchangeCode(code).catch(() => null)
  if (!result) return back('denied')

  const pool = await getPool()
  await pool.query(
    `insert into mail_connections (user_id, provider, email, refresh_token) values ($1,'google',$2,$3)
     on conflict (user_id) do update set provider = 'google', email = excluded.email, refresh_token = excluded.refresh_token, created_at = now()`,
    [user.id, result.email, seal(result.refreshToken)],
  )
  return back('connected')
}
