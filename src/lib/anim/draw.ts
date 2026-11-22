import type { Frame, Palette } from './types'

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ESC[c])

export const MONO = 'JetBrains Mono'
export const SANS = 'Inter'
export const MONO_W = 0.6
export const SANS_W = 0.6

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3)

const toRgb = (hex: string) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = toRgb(a)
  const [r2, g2, b2] = toRgb(b)
  const c = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0')
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`
}

export const luminance = (hex: string) => {
  const [r, g, b] = toRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export const makePalette = (p: Omit<Palette, 'accent2'> & { accent2?: string }): Palette => ({
  ...p,
  accent2: p.accent2 || mix(p.accent, luminance(p.bg) > 0.5 ? '#000000' : '#ffffff', 0.3),
})

export function rng(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246123965)
    h = Math.imul(h ^ (h >>> 13), 3266489917)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export type TextOpts = {
  size?: number
  fill: string
  weight?: 400 | 700
  family?: 'mono' | 'sans'
  anchor?: 'start' | 'middle' | 'end'
  ls?: number
  opacity?: number
  extra?: string
}

export function txt(x: number, y: number, s: string, o: TextOpts) {
  const fam = o.family === 'sans' ? SANS : MONO
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${o.size ?? 13}" font-weight="${o.weight ?? 400}" fill="${o.fill}" text-anchor="${o.anchor ?? 'start'}" xml:space="preserve"${
    o.ls ? ` letter-spacing="${o.ls}"` : ''
  }${o.opacity !== undefined && o.opacity < 1 ? ` opacity="${o.opacity.toFixed(2)}"` : ''}${o.extra ? ` ${o.extra}` : ''}>${esc(s)}</text>`
}

export const charW = (size: number, family: 'mono' | 'sans' = 'mono') => size * (family === 'mono' ? MONO_W : SANS_W)

export function truncate(s: string, maxChars: number) {
  const chars = Array.from(s)
  return chars.length <= maxChars ? s : chars.slice(0, Math.max(1, maxChars - 1)).join('') + '…'
}

export function fit(s: string, maxWidth: number, size: number, min: number, family: 'mono' | 'sans' = 'mono') {
  let sz = size
  const len = Array.from(s).length
  while (sz > min && len * charW(sz, family) > maxWidth) sz -= 1
  const max = Math.floor(maxWidth / charW(sz, family))
  return { text: truncate(s, max), size: sz }
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => Array.from(w)[0]?.toUpperCase() || '')
    .join('')

export type Seg = { t: string; fill: string }
export type Line = {
  x: number
  y: number
  size: number
  weight?: 400 | 700
  family?: 'mono' | 'sans'
  segs: Seg[]
  glow?: string
}

const lineLength = (l: Line) => l.segs.reduce((n, s) => n + Array.from(s.t).length, 0)

export function renderLine(l: Line, n: number) {
  let left = n
  let out = ''
  let x = l.x
  const cw = charW(l.size, l.family)
  for (const s of l.segs) {
    if (left <= 0) break
    const chars = Array.from(s.t)
    const part = chars.slice(0, left).join('')
    out += txt(x, l.y, part, { size: l.size, fill: s.fill, weight: l.weight, family: l.family })
    x += chars.length * cw
    left -= chars.length
  }
  return { svg: out, endX: l.x + Math.min(n, lineLength(l)) * cw }
}

export type TypeOpts = {
  base?: string
  step?: number
  delay?: number
  cursor: string
  cursorOn?: boolean
}

export function typedState(lines: Line[], total: number, o: TypeOpts, cursorVisible = true) {
  let left = total
  let svg = o.base || ''
  let cursor = ''
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    const len = lineLength(l)
    const n = Math.min(left, len)
    if (n <= 0 && i > 0) break
    const r = renderLine(l, n)
    svg += r.svg
    left -= n
    if (left <= 0 || i === lines.length - 1) {
      const cw = charW(l.size, l.family)
      cursor = `<rect x="${r.endX + 1}" y="${l.y - l.size * 0.82}" width="${cw * 0.85}" height="${l.size * 1.05}" fill="${o.cursor}"/>`
      if (left <= 0) break
    }
  }
  return svg + (cursorVisible ? cursor : '')
}

export function typeSeq(lines: Line[], o: TypeOpts): Frame[] {
  const total = lines.reduce((n, l) => n + lineLength(l), 0)
  const step = o.step ?? 2
  const frames: Frame[] = []
  for (let n = 0; n <= total; n += step) frames.push({ svg: typedState(lines, n, o), delay: o.delay ?? 55 })
  return frames
}

export function holdBlink(lines: Line[], o: TypeOpts, cycles = 3, ms = 520): Frame[] {
  const total = lines.reduce((n, l) => n + lineLength(l), 0)
  const out: Frame[] = []
  for (let i = 0; i < cycles; i++) {
    out.push({ svg: typedState(lines, total, o, true), delay: ms })
    out.push({ svg: typedState(lines, total, o, false), delay: ms })
  }
  return out
}

export const windowBar = (w: number, pal: Palette, label: string, h = 28) =>
  `<rect width="${w}" height="${h}" fill="${mix(pal.bg, luminance(pal.bg) > 0.5 ? '#000000' : '#ffffff', 0.05)}"/>` +
  `<circle cx="16" cy="${h / 2}" r="5" fill="#ff5f57"/><circle cx="32" cy="${h / 2}" r="5" fill="#febc2e"/><circle cx="48" cy="${h / 2}" r="5" fill="#28c840"/>` +
  txt(w / 2, h / 2 + 4, label, { size: 11, fill: pal.muted, anchor: 'middle' })

export const hold = (svg: string, ms: number): Frame => ({ svg, delay: ms })
