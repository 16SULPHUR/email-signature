import { luminance } from './extras'
import type { Style } from './types'

const LIGHT_INBOX = 'FFFFFF'
const DARK_INBOX = '202124'

const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const clean = (v: string) => v.replace('#', '').toUpperCase()

export function contrastWarnings(style: Pick<Style, 'text' | 'muted' | 'accent'>) {
  const out: string[] = []
  const checks = [
    ['Text', style.text, 4.5],
    ['Secondary text', style.muted, 3],
    ['Accent colour', style.accent, 3],
  ] as const
  for (const [label, color, min] of checks) {
    const c = clean(color)
    if (!/^[0-9A-F]{6}$/.test(c)) continue
    if (ratio(c, LIGHT_INBOX) < min) out.push(`${label} is hard to read on a white background.`)
    if (ratio(c, DARK_INBOX) < min) out.push(`${label} is hard to read in dark mode.`)
  }
  return out
}
