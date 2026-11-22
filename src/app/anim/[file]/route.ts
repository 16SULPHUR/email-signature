import { renderAnim } from '@/lib/signature/anim'

const HEX = /^[0-9a-fA-F]{6}$/

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = (await params).file.replace(/\.gif$/, '')
  const q = new URL(req.url).searchParams
  const color = HEX.test(q.get('c') || '') ? q.get('c')! : '2563EB'
  const bg = HEX.test(q.get('bg') || '') ? q.get('bg')! : 'FFFFFF'
  const gif = await renderAnim(name, { color, bg, w: Number(q.get('w')) || 400 })
  if (!gif) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(gif), {
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
