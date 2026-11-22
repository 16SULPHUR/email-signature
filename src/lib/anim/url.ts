import type { Template } from '@/lib/signature/types'

type Colors = { accent: string; text: string; muted: string; bg: string }
type Texts = { name?: string; title?: string; company?: string; tagline?: string }

const bare = (c: string) => c.replace('#', '')

export function animUrl(siteUrl: string, anim: NonNullable<Template['animation']>, f: Texts, c: Colors) {
  const q = new URLSearchParams()
  const put = (k: string, v?: string) => {
    const t = (v || '').trim()
    if (t) q.set(k, t)
  }
  put('n', f.name)
  put('t', f.title)
  put('c', f.company)
  put('g', f.tagline)
  q.set('a', bare(c.accent))
  q.set('x', bare(c.text))
  q.set('m', bare(c.muted))
  q.set('b', bare(c.bg))
  for (const [k, v] of Object.entries(anim.params || {})) put(k, v)
  return `${siteUrl}/anim/${anim.kind}.gif?${q.toString()}`
}
