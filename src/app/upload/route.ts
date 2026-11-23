import crypto from 'node:crypto'
import { headers as getHeaders } from 'next/headers'
import sharp from 'sharp'

import { getPayloadClient, getPool } from '@/lib/server/db'
import { IMAGE_LIMITS as L } from '@/lib/server/limits'

const fail = (error: string, status = 400) => Response.json({ error }, { status })

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  const rawKind = String(form?.get('kind') || '')
  const kind = (['logo', 'banner', 'handwriting'] as const).find((k) => k === rawKind) || 'photo'
  if (!(file instanceof File)) return fail('No file received')
  if (file.size > L.maxInputBytes) return fail('Image is too large (max 5 MB)')

  const headers = await getHeaders()
  const ip = (headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  const ipHash = crypto.createHash('sha256').update(`${ip}:${process.env.PAYLOAD_SECRET}`).digest('hex').slice(0, 32)
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers })
  const pool = await getPool()

  let out: Buffer
  let mime: string
  try {
    const input = Buffer.from(await file.arrayBuffer())
    const meta = await sharp(input).metadata()
    if (kind === 'banner' && meta.format === 'gif' && (meta.pages || 1) > 1) {
      if (input.length > L.bannerGifMaxBytes) return fail('Animated GIF is too large (max 500 KB)')
      if ((meta.width || 0) > L.bannerWidth) return fail(`Animated GIF must be at most ${L.bannerWidth}px wide`)
      out = input
      mime = 'image/gif'
    } else {
      const img = sharp(input, { animated: false }).rotate()
      if (kind === 'photo') {
        out = await img
          .resize(L.photoSize, L.photoSize, { fit: 'cover', position: 'attention' })
          .flatten({ background: '#ffffff' })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer()
        mime = 'image/jpeg'
      } else {
        const resized =
          kind === 'banner'
            ? img.resize({ width: L.bannerWidth, withoutEnlargement: true })
            : kind === 'handwriting'
              ? img.resize(L.handwritingMaxWidth, L.handwritingMaxHeight, { fit: 'inside', withoutEnlargement: true })
              : img.resize(L.logoMaxWidth, L.logoMaxHeight, { fit: 'inside', withoutEnlargement: true })
        if (meta.hasAlpha || kind === 'handwriting') {
          out = await resized.png({ palette: true, compressionLevel: 9 }).toBuffer()
          mime = 'image/png'
        } else {
          out = await resized.flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
          mime = 'image/jpeg'
        }
      }
    }
  } catch {
    return fail('That file is not an image we can read')
  }
  if (out.length > (mime === 'image/gif' ? L.bannerGifMaxBytes : L.maxStoredBytes)) return fail('Image is too detailed to store, try a simpler one')

  const hash = crypto.createHash('sha256').update(out).digest('hex')
  const existing = await pool.query('select id from signature_images where hash = $1', [hash])
  if (existing.rows[0]) return Response.json({ url: imageUrl(req, existing.rows[0].id, mime) })

  const { rows } = await pool.query(
    `select
      (select count(*) from signature_images where ip_hash = $1 and created_at > now() - interval '1 hour')::int as hour,
      (select count(*) from signature_images where ip_hash = $1 and created_at > now() - interval '1 day')::int as day,
      (select count(*) from signature_images where owner_id = $2)::int as owned,
      (select coalesce(sum(size), 0) from signature_images)::bigint as total`,
    [ipHash, user?.id ?? null],
  )
  const usage = rows[0]
  if (usage.hour >= L.perIpPerHour || usage.day >= L.perIpPerDay)
    return fail('Upload limit reached, please try again later', 429)
  if (user && usage.owned >= L.perUserTotal) return fail('You have reached the upload limit for your account', 429)
  if (Number(usage.total) + out.length > L.totalStoreBytes)
    return fail('Image hosting is full right now. Paste a link to an image instead.', 507)

  const id = crypto.randomBytes(12).toString('base64url')
  await pool.query(
    'insert into signature_images (id, hash, mime, size, data, kind, owner_id, ip_hash) values ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id, hash, mime, out.length, out, kind, user?.id ?? null, ipHash],
  )
  return Response.json({ url: imageUrl(req, id, mime) })
}

function imageUrl(req: Request, id: string, mime: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '')
  const ext = mime === 'image/png' ? 'png' : mime === 'image/gif' ? 'gif' : 'jpg'
  return `${base}/img/${id}.${ext}`
}
