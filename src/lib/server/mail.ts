import crypto from 'node:crypto'

export const MAIL_LIMITS = {
  perHour: 20,
  perDay: 100,
  bodyChars: 20000,
}

const SCOPES = 'openid email https://www.googleapis.com/auth/gmail.send'

export const googleMailEnabled = () => Boolean(process.env.GOOGLE_MAIL_CLIENT_ID && process.env.GOOGLE_MAIL_CLIENT_SECRET)

export const siteOrigin = () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
const redirectUri = () => `${siteOrigin()}/api/mail/google/callback`

const key = () => crypto.createHash('sha256').update(`mail:${process.env.PAYLOAD_SECRET}`).digest()

export function seal(plain: string) {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()])
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url')
}

export function unseal(token: string) {
  const buf = Buffer.from(token, 'base64url')
  const d = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12))
  d.setAuthTag(buf.subarray(12, 28))
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8')
}

export function googleAuthUrl(state: string) {
  const q = new URLSearchParams({
    client_id: process.env.GOOGLE_MAIL_CLIENT_ID!,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`
}

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_MAIL_CLIENT_ID!,
      client_secret: process.env.GOOGLE_MAIL_CLIENT_SECRET!,
      ...params,
    }),
  })
  const body = await res.json().catch(() => ({}))
  return { ok: res.ok, body }
}

export async function exchangeCode(code: string) {
  const { ok, body } = await tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri() })
  if (!ok || !body.refresh_token || !body.id_token) return null
  const claims = JSON.parse(Buffer.from(String(body.id_token).split('.')[1], 'base64url').toString())
  if (!claims.email) return null
  const granted = String(body.scope || '')
  if (!granted.includes('gmail.send')) return null
  return { refreshToken: body.refresh_token as string, email: String(claims.email) }
}

export class ReconnectError extends Error {}

async function accessToken(refreshToken: string) {
  const { ok, body } = await tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken })
  if (!ok) {
    if (body.error === 'invalid_grant') throw new ReconnectError('Gmail access was revoked')
    throw new Error('Could not reach Gmail')
  }
  return body.access_token as string
}

const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n')
const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`)

export const isEmail = (s: string) => /^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]+$/.test(s) && s.length <= 200

export function buildMime(o: {
  from: string
  to: string
  toName?: string
  subject: string
  html: string
  text: string
}) {
  const boundary = `sigrio_${crypto.randomBytes(12).toString('hex')}`
  const to = o.toName ? `${encodeHeader(clean(o.toName).replace(/["\\]/g, ''))} <${o.to}>` : o.to
  return [
    `From: ${o.from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(clean(o.subject))}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(o.text),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(o.html),
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

export async function gmailSend(refreshToken: string, mime: string) {
  const token = await accessToken(refreshToken)
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: Buffer.from(mime).toString('base64url') }),
  })
  if (res.status === 401 || res.status === 403) throw new ReconnectError('Gmail refused the request')
  if (!res.ok) throw new Error('Gmail could not send this email')
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function bodyToHtml(text: string) {
  const paras = text
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222">${paras}</div>`
}

export function htmlToText(html: string) {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(tr|p|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

export async function loadSignatureHtml(userId: number | string, signatureId: number) {
  const { getPool } = await import('@/lib/server/db')
  const { getTemplates } = await import('@/lib/server/templates')
  const { renderSignature } = await import('@/lib/signature/render')
  const pool = await getPool()
  const sig = (await pool.query('select template, data from signatures where id = $1 and owner_id = $2', [signatureId, userId])).rows[0]
  const tpl = sig && (await getTemplates()).find((t) => t.id === sig.template)
  if (!sig || !tpl) return null
  return renderSignature(tpl, sig.data, siteOrigin())
}
