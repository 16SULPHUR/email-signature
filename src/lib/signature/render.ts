import Mustache from 'mustache'

import { animUrl } from '@/lib/anim/url'

import { addUtm, bannerBlock, ctaBlock, contactBlock, disclaimerBlock, extrasBefore, handwritingBlock } from './extras'
import { NETWORK_MAP } from './networks'
import type { SignatureData, Style, Template } from './types'

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
Mustache.escape = (v: string) => String(v).replace(/[&<>"']/g, (c) => ESC[c])

export const DEFAULT_STYLE: Omit<Style, keyof Template['theme']> = {
  iconSize: 20,
  avatarSize: 80,
  iconStyle: 'brand',
  avatarShape: 'template',
  logoWidth: 96,
  photoLink: '',
}

const AVATAR_RADIUS = { circle: '50%', rounded: '12px', square: '0' } as const

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

const assetUrl = (siteUrl: string, raw: string | undefined) => {
  const v = (raw || '').trim()
  return v.startsWith('/') && !v.startsWith('//') ? `${siteUrl}${v}` : safeUrl(v)
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
        iconBadgeDark: iconUrl(siteUrl, n.id, bg, accent),
      }
    })

  const customFields = (data.customFields || [])
    .filter((c) => c.value?.trim())
    .map((c) => ({ label: c.label?.trim() || '', value: c.value.trim(), href: /^https?:\/\//i.test(c.value.trim()) ? c.value.trim() : '' }))

  const rawWebsite = safeUrl(f.website)
  const website = addUtm(rawWebsite, data.extras)
  const ctaUrl = addUtm(safeUrl(f.ctaUrl), data.extras)
  const contactIcon = (name: string) => iconUrl(siteUrl, name, accent)

  return {
    ...f,
    photoUrl: assetUrl(siteUrl, f.photoUrl),
    logoUrl: assetUrl(siteUrl, f.logoUrl),
    website,
    websiteLabel: f.websiteLabel?.trim() || (rawWebsite ? displayHost(rawWebsite) : ''),
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
    animUrl: template.animation
      ? animUrl(siteUrl, template.animation, { ...f, site: f.websiteLabel?.trim() || (rawWebsite ? displayHost(rawWebsite) : '') }, { accent: `#${accent}`, text: `#${text}`, muted: `#${muted}`, bg: `#${bg}` })
      : '',
    socials,
    hasSocials: socials.length > 0,
    customFields,
    hasCustomFields: customFields.length > 0,
    avatarRadius:
      style.avatarShape === 'template' ? template.defaults?.avatarRadius || '50%' : AVATAR_RADIUS[style.avatarShape],
    logoWidth: Number(style.logoWidth) || 96,
    photoLink: safeUrl(style.photoLink),
    siteUrl,
  }
}

const CUSTOM_FIELDS_BLOCK = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px;font-family:{{font}};"><tr><td style="font-size:12px;line-height:18px;color:{{muted}};">{{#customFields}}{{#label}}<span style="color:{{muted}};">{{label}}:</span> {{/label}}{{#href}}<a href="{{href}}" style="color:{{accent}};text-decoration:none;">{{value}}</a>{{/href}}{{^href}}<span style="color:{{text}};">{{value}}</span>{{/href}}<br>{{/customFields}}</td></tr></table>`

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function applyPhotoOptions(html: string, ctx: ReturnType<typeof buildContext>, template: Template, style: Style) {
  if (!ctx.photoUrl) return html
  const src = Mustache.render('{{photoUrl}}', ctx)
  const imgRe = new RegExp(`<img[^>]*src="${escapeRe(src)}"[^>]*>`, 'g')
  return html.replace(imgRe, (tag) => {
    let out = tag
    if (style.avatarShape !== 'template' && !template.html.includes('avatarRadius'))
      out = out.replace(/border-radius:[^;"]+/g, `border-radius:${ctx.avatarRadius}`)
    if (ctx.photoLink && !template.html.includes('photoLink'))
      out = `<a href="${Mustache.render('{{photoLink}}', ctx)}" style="text-decoration:none;">${out}</a>`
    return out
  })
}

export function renderSignature(template: Template, data: SignatureData, siteUrl: string): string {
  const ctx = buildContext(template, data, siteUrl)
  let html = extrasBefore(template, ctx) + handwritingBlock(data.extras, ctx.name) + Mustache.render(template.html, ctx)
  html += ctaBlock(template, ctx)
  if (ctx.hasCustomFields && !template.html.includes('customFields')) html += Mustache.render(CUSTOM_FIELDS_BLOCK, ctx)
  html += contactBlock(data.extras, {
    siteUrl,
    fields: data.fields || {},
    link: safeUrl(data.extras?.qrLink),
    font: ctx.font,
    accent: ctx.accent,
  })
  html += bannerBlock(data.extras, addUtm(safeUrl(data.extras?.bannerLink), data.extras))
  html += disclaimerBlock(template, ctx)
  html = applyPhotoOptions(html, ctx, template, resolveStyle(template, data))
  return html.replace(/>\s*\n\s*</g, '><').trim()
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
