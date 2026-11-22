import sharp from 'sharp'

import { iconSvg } from '@/lib/signature/icons'

const HEX = /^[0-9a-fA-F]{6}$/
const SIZE = 96

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const name = file.replace(/\.png$/, '')
  const q = new URL(req.url).searchParams
  const color = HEX.test(q.get('c') || '') ? q.get('c')! : '000000'
  const bg = HEX.test(q.get('bg') || '') ? q.get('bg')! : undefined
  const radius = Math.min(50, Math.max(0, Number(q.get('r') ?? 50) || 0))

  const svg = iconSvg(name, { color, bg, size: SIZE, radius })
  if (!svg) return new Response('Not found', { status: 404 })

  const png = await sharp(Buffer.from(svg)).png().toBuffer()
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
