import { encodeGif } from '@/lib/anim/encode'
import { makePalette } from '@/lib/anim/draw'
import { SCENES } from '@/lib/anim/scenes'

export const runtime = 'nodejs'
export const maxDuration = 30

const HEX = /^[0-9a-fA-F]{6}$/
const cache = new Map<string, Uint8Array>()
const CACHE_MAX = 40

const clean = (v: string | null, max: number) =>
  (v || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

const color = (v: string | null, fallback: string) => `#${HEX.test(v || '') ? v : fallback}`

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const kind = file.replace(/\.gif$/, '')
  const make = SCENES[kind]
  if (!make) return new Response('Not found', { status: 404 })

  const q = new URL(req.url).searchParams
  const key = `${kind}?${[...q.entries()].sort().join('&')}`
  let bytes = cache.get(key)

  if (!bytes) {
    const pal = makePalette({
      bg: color(q.get('b'), '111111'),
      text: color(q.get('x'), 'FFFFFF'),
      muted: color(q.get('m'), '888888'),
      accent: color(q.get('a'), 'FF7A1A'),
    })
    const input = {
      name: clean(q.get('n'), 40) || 'Your Name',
      title: clean(q.get('t'), 50),
      company: clean(q.get('c'), 40),
      tagline: clean(q.get('g'), 60),
      pal,
      params: { cmd: clean(q.get('cmd'), 30), done: clean(q.get('done'), 34), font: clean(q.get('font'), 8) },
    }
    const scale = q.get('sc') === '1' ? 1 : 2
    const loop = q.get('lp') === '0' ? 0 : 2
    bytes = encodeGif(make(), input, { scale, loop })
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!)
    cache.set(key, bytes)
  }

  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  })
}
