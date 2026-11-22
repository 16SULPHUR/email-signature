import sharp from 'sharp'

export type AnimOpts = { color: string; bg: string; w: number }

type Anim = { w: (o: AnimOpts) => number; h: number; delay: number; frames: number; draw: (i: number, o: AnimOpts, w: number) => string }

const svg = (w: number, h: number, bg: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#${bg}"/>${body}</svg>`

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

export const ANIMS: Record<string, Anim> = {
  scan: {
    w: (o) => clamp(o.w, 40, 640),
    h: 3,
    delay: 60,
    frames: 20,
    draw: (i, o, w) => {
      const x = ((i / 20) * (w + 120)) - 120
      return svg(
        w,
        3,
        o.bg,
        `<defs><linearGradient id="g"><stop offset="0" stop-color="#${o.color}" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#${o.color}" stop-opacity="0"/></linearGradient></defs><rect width="${w}" height="3" fill="#${o.color}" fill-opacity=".45"/><rect x="${x}" width="120" height="3" fill="url(#g)"/>`,
      )
    },
  },
  wave: {
    w: (o) => clamp(o.w, 40, 640),
    h: 6,
    delay: 70,
    frames: 24,
    draw: (i, o, w) => {
      const shift = (i / 24) * 160
      const stops = [0, 40, 80, 120, 160, 200]
        .map((p, k) => `<stop offset="${p / 200}" stop-color="#${o.color}" stop-opacity="${k % 2 ? 0.35 : 1}"/>`)
        .join('')
      return svg(
        w,
        6,
        o.bg,
        `<defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${-shift}" x2="${200 - shift}" spreadMethod="repeat">${stops}</linearGradient></defs><rect width="${w}" height="6" rx="3" fill="url(#g)"/>`,
      )
    },
  },
  cursor: {
    w: () => 9,
    h: 16,
    delay: 500,
    frames: 2,
    draw: (i, o) => svg(9, 16, o.bg, i === 0 ? `<rect x="1" y="1" width="8" height="15" fill="#${o.color}"/>` : ''),
  },
  pulse: {
    w: () => 16,
    h: 16,
    delay: 90,
    frames: 12,
    draw: (i, o) => {
      const t = i / 12
      const r = 3 + t * 5
      return svg(
        16,
        16,
        o.bg,
        `<circle cx="8" cy="8" r="${r}" fill="#${o.color}" fill-opacity="${(1 - t) * 0.5}"/><circle cx="8" cy="8" r="3.5" fill="#${o.color}"/>`,
      )
    },
  },
  eq: {
    w: () => 26,
    h: 20,
    delay: 110,
    frames: 12,
    draw: (i, o) => {
      const bars = [0, 1, 2, 3, 4].map((b) => {
        const h = 4 + Math.abs(Math.sin((i + b * 2.3) / 1.9)) * 14
        return `<rect x="${b * 5 + 1}" y="${20 - h}" width="3" height="${h}" rx="1" fill="#${o.color}"/>`
      })
      return svg(26, 20, o.bg, bars.join(''))
    },
  },
  typing: {
    w: () => 30,
    h: 12,
    delay: 140,
    frames: 12,
    draw: (i, o) => {
      const dots = [0, 1, 2].map((d) => {
        const y = 6 - Math.max(0, Math.sin(((i - d * 2) / 12) * Math.PI * 2)) * 3
        return `<circle cx="${5 + d * 10}" cy="${y}" r="2.5" fill="#${o.color}"/>`
      })
      return svg(30, 12, o.bg, dots.join(''))
    },
  },
}

export async function renderAnim(name: string, o: AnimOpts) {
  const a = ANIMS[name]
  if (!a) return null
  const w = a.w(o)
  const raw = await Promise.all(
    Array.from({ length: a.frames }, (_, i) => sharp(Buffer.from(a.draw(i, o, w))).ensureAlpha().raw().toBuffer()),
  )
  return sharp(Buffer.concat(raw), { raw: { width: w, height: a.h * a.frames, channels: 4, pageHeight: a.h } })
    .gif({ delay: Array(a.frames).fill(a.delay), loop: 0, effort: 3 })
    .toBuffer()
}
