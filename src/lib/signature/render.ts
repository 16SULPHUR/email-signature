import Mustache from 'mustache'

import { NETWORK_MAP } from './networks'
import type { SignatureData, Style, Template } from './types'

export const DEFAULT_STYLE: Omit<Style, keyof Template['theme']> = {
  iconSize: 20,
  avatarSize: 80,
  iconStyle: 'brand',
}

const hex = (v: string | undefined, fallback: string) => {
  const c = (v || '').replace('#', '').trim()
  return /^[0-9a-fA-F]{6}$/.test(c) ? c.toUpperCase() : fallback.replace('#', '').toUpperCase()
}

export function safeUrl(raw: string | undefined): string {
  const v = (raw || '').trim()
  if (!v) return ''
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return ''
  return `https://${v.replace(/^\/+/, '')}`
}

const telHref = (v: string | undefined) => {
  const digits = (v || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

const displayHost = (url: string) => url.replace(/^https?:\/\//i, '').replace(/\/$/, '')

export function iconUrl(siteUrl: string, name: string, color: string, bg?: string, radius = 50) {
  const q = new URLSearchParams({ c: color })
  if (bg) {
    q.set('bg', bg)
    q.set('r', String(radius))
  }
  return `${siteUrl}/icon/${name}.png?${q.toString()}`
}

export function resolveStyle(template: Template, data: SignatureData): Style {
  return {
    ...template.theme,
    ...DEFAULT_STYLE,
    ...template.defaults,
    ...stripEmpty(data.style),
  } as Style
}

function stripEmpty<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(o || {}).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  ) as Partial<T>
}

export function buildContext(template: Template, data: SignatureData, siteUrl: string) {
  const style = resolveStyle(template, data)
  const f = data.fields || {}
  const accent = hex(style.accent, '2563EB')
  const text = hex(style.text, '111827')
  const muted = hex(style.muted, '6B7280')
  const bg = hex(style.bg, 'FFFFFF')

  const socials = (data.socials || [])
    .filter((s) => s.url?.trim() && NETWORK_MAP[s.network])
    .map((s) => {
      const n = NETWORK_MAP[s.network]
      const brand = iconUrl(siteUrl, n.id, n.color)
      const mono = iconUrl(siteUrl, n.id, accent)
      const badge = iconUrl(siteUrl, n.id, 'FFFFFF', n.color)
      const badgeMono = iconUrl(siteUrl, n.id, 'FFFFFF', accent)
      const pick = { brand, mono, badge, badgeMono }[style.iconStyle] || brand
      return {
        network: n.id,
        label: n.label,
        url: safeUrl(s.url),
        icon: pick,
        iconBrand: brand,
        iconMono: mono,
        iconBadge: badge,
        iconBadgeMono: badgeMono,
      }
    })

  const website = safeUrl(f.website)
  const ctaUrl = safeUrl(f.ctaUrl)
  const contactIcon = (name: string) => iconUrl(siteUrl, name, accent)

  return {
    ...f,
    photoUrl: safeUrl(f.photoUrl),
    logoUrl: safeUrl(f.logoUrl),
    website,
    websiteLabel: f.websiteLabel?.trim() || (website ? displayHost(website) : ''),
    ctaUrl,
    ctaText: ctaUrl ? f.ctaText : '',
    phoneHref: telHref(f.phone),
    mobileHref: telHref(f.mobile),
    emailHref: f.email ? `mailto:${f.email.trim()}` : '',
    accent: `#${accent}`,
    text: `#${text}`,
    muted: `#${muted}`,
    bg: `#${bg}`,
    font: style.font,
    iconSize: Number(style.iconSize) || 20,
    avatarSize: Number(style.avatarSize) || 80,
    phoneIcon: contactIcon('phone'),
    mobileIcon: contactIcon('mobile'),
    emailIcon: contactIcon('email'),
    webIcon: contactIcon('website'),
    addressIcon: contactIcon('address'),
    socials,
    hasSocials: socials.length > 0,
    siteUrl,
  }
}

export function renderSignature(template: Template, data: SignatureData, siteUrl: string): string {
  return Mustache.render(template.html, buildContext(template, data, siteUrl))
    .replace(/>\s*\n\s*</g, '><')
    .trim()
}

export function toPlainText(html: string): string {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ')
  const el = document.createElement('div')
  el.innerHTML = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/(tr|p|div)>/gi, '\n')
  return (el.textContent || '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}
