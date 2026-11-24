import crypto from 'node:crypto'

import { requireUser } from '@/lib/server/account'
import { getPool } from '@/lib/server/db'
import {
  MAIL_LIMITS,
  ReconnectError,
  bodyToHtml,
  buildMime,
  gmailSend,
  htmlToText,
  isEmail,
  loadSignatureHtml,
  siteOrigin,
  unseal,
} from '@/lib/server/mail'
import { TRACKING_LIMITS } from '@/lib/server/tracking'

const fail = (error: string, status: number, extra: object = {}) =>
  Response.json({ error, ...extra }, { status })

export async function POST(req: Request) {
  const { user, error } = await requireUser()
  if (error) return error
  const input = await req.json().catch(() => ({}))
  const to = String(input.to || '').trim()
  const toName = String(input.toName || '')
    .trim()
    .slice(0, 200)
  const subject = String(input.subject || '')
    .trim()
    .slice(0, 300)
  const text = String(input.body || '')
  const signatureId = input.signatureId ? Number(input.signatureId) : null

  if (!isEmail(to)) return fail('Enter a valid recipient email', 400)
  if (!subject) return fail('Add a subject', 400)
  if (!text.trim()) return fail('Write a message', 400)
  if (text.length > MAIL_LIMITS.bodyChars)
    return fail(`Message is too long (max ${MAIL_LIMITS.bodyChars} characters)`, 400)

  const pool = await getPool()
  const conn = (
    await pool.query('select email, refresh_token from mail_connections where user_id = $1', [
      user.id,
    ])
  ).rows[0]
  if (!conn) return fail('Connect your Gmail first', 409, { reconnect: true })

  const counts = (
    await pool.query(
      `select count(*)::int as total,
        count(*) filter (where sent_at > now() - interval '1 hour')::int as hour,
        count(*) filter (where sent_at > now() - interval '1 day')::int as day
       from tracked_emails where user_id = $1`,
      [user.id],
    )
  ).rows[0]
  if (counts.hour >= MAIL_LIMITS.perHour)
    return fail('Hourly sending limit reached, try again later', 429)
  if (counts.day >= MAIL_LIMITS.perDay)
    return fail('Daily sending limit reached, try again tomorrow', 429)
  if (counts.total >= TRACKING_LIMITS.perUser)
    return fail(
      `You can track up to ${TRACKING_LIMITS.perUser} emails. Delete old ones first.`,
      429,
    )

  let signature = ''
  if (signatureId) {
    const html = await loadSignatureHtml(user.id, signatureId)
    if (html === null) return fail('That signature is no longer available', 400)
    signature = html
  }

  const id = crypto.randomBytes(9).toString('base64url')
  await pool.query(
    'insert into tracked_emails (id, user_id, subject, recipient_name, recipient_email) values ($1,$2,$3,$4,$5)',
    [id, user.id, subject, toName || null, to],
  )
  const pixel = `<img src="${siteOrigin()}/t/${id}.gif" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`
  const html = `${bodyToHtml(text)}${signature ? `<br>${signature}` : ''}${pixel}`
  const plain = `${text.trim()}${signature ? `\n\n-- \n${htmlToText(signature)}` : ''}`

  try {
    await gmailSend(
      unseal(conn.refresh_token),
      buildMime({ from: conn.email, to, toName, subject, html, text: plain }),
    )
  } catch (e) {
    await pool.query('delete from tracked_emails where id = $1', [id])
    if (e instanceof ReconnectError) {
      await pool.query('delete from mail_connections where user_id = $1', [user.id])
      return fail('Gmail access expired. Connect it again.', 409, { reconnect: true })
    }
    return fail((e as Error).message, 502)
  }
  await pool.query('update tracked_emails set sent_at = now() where id = $1', [id])
  return Response.json({ id })
}
