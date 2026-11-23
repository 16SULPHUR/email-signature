import Mustache from 'mustache'

import type { Extras, Template } from './types'

export const DISCLAIMER_PRESETS = [
  {
    id: 'general',
    label: 'General confidentiality',
    text: 'This email and any attachments are confidential and intended solely for the addressee. If you have received it in error, please notify the sender and delete it.',
  },
  {
    id: 'legal',
    label: 'Legal',
    text: 'This message may contain privileged and confidential attorney-client communications. If you are not the intended recipient, any review, use or distribution is prohibited. Please notify the sender immediately and delete this message.',
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    text: 'This message may contain protected health information that is confidential and legally privileged. It is intended only for the named recipient. If you received it in error, notify the sender immediately and delete it. Unauthorized disclosure is prohibited.',
  },
  {
    id: 'finance',
    label: 'Finance',
    text: 'This message is for the intended recipient only and does not constitute investment advice or an offer to buy or sell any security. Past performance is not indicative of future results. If received in error, please delete it and notify the sender.',
  },
  {
    id: 'eco',
    label: 'Eco note',
    text: 'Please consider the environment before printing this email.',
  },
] as const

export const MEETING_PROVIDERS = [
  { id: 'calendly', label: 'Calendly', base: 'https://calendly.com/' },
  { id: 'cal', label: 'Cal.com', base: 'https://cal.com/' },
] as const

export function addUtm(url: string, extras: Extras | undefined) {
  if (!extras?.utm || !/^https?:\/\//i.test(url)) return url
  try {
    const u = new URL(url)
    u.searchParams.set('utm_source', 'email-signature')
    u.searchParams.set('utm_medium', 'email')
    u.searchParams.set('utm_campaign', extras.utmCampaign?.trim() || 'signature')
    return u.toString()
  } catch {
    return url
  }
}

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const readableOn = (hex: string) => (luminance(hex.replace('#', '')) > 0.45 ? '#111827' : '#FFFFFF')

type Ctx = {
  font: string
  accent: string
  text: string
  muted: string
  signoff?: string
  ctaUrl: string
  ctaText?: string
  disclaimer?: string
}

const SIGNOFF = `<div style="font-family:{{font}};font-size:13px;line-height:20px;color:{{text}};padding-bottom:8px;">{{signoff}}</div>`

const CTA = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:12px;"><tr><td bgcolor="{{accent}}" style="background:{{accent}};border-radius:6px;"><a href="{{ctaUrl}}" style="display:inline-block;padding:8px 16px;font-family:{{font}};font-size:13px;line-height:18px;font-weight:bold;color:{{ctaColor}};text-decoration:none;">{{ctaText}}</a></td></tr></table>`

const DISCLAIMER = `<table cellpadding="0" cellspacing="0" border="0" width="520" style="border-collapse:collapse;margin-top:14px;"><tr><td style="border-top:1px solid #D1D5DB;padding-top:8px;font-family:{{font}};font-size:10px;line-height:14px;color:{{muted}};">{{disclaimer}}</td></tr></table>`

const uses = (t: Template, key: string) => t.html.includes(key)

export function extrasBefore(t: Template, ctx: Ctx) {
  if (!ctx.signoff?.trim() || uses(t, 'signoff')) return ''
  return Mustache.render(SIGNOFF, ctx)
}

export function ctaBlock(t: Template, ctx: Ctx) {
  if (!ctx.ctaUrl || !ctx.ctaText?.trim() || uses(t, 'ctaText')) return ''
  return Mustache.render(CTA, { ...ctx, ctaColor: readableOn(ctx.accent) })
}

export function disclaimerBlock(t: Template, ctx: Ctx) {
  if (!ctx.disclaimer?.trim() || uses(t, 'disclaimer')) return ''
  return Mustache.render(DISCLAIMER, ctx)
}

const BANNER = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:14px;"><tr><td>{{#link}}<a href="{{link}}" style="text-decoration:none;">{{/link}}<img src="{{src}}" width="{{width}}" alt="" style="display:block;border:0;width:{{width}}px;max-width:100%;height:auto;">{{#link}}</a>{{/link}}</td></tr></table>`

const HANDWRITING = `<div style="padding-bottom:6px;"><img src="{{src}}" width="150" alt="{{name}}" style="display:block;border:0;width:150px;height:auto;"></div>`

export function bannerBlock(extras: Extras | undefined, link: string) {
  const src = extras?.bannerUrl?.trim()
  if (!src) return ''
  return Mustache.render(BANNER, { src, link, width: 520 })
}

export function handwritingBlock(extras: Extras | undefined, name: string | undefined) {
  const src = extras?.handwritingUrl?.trim()
  if (!src) return ''
  return Mustache.render(HANDWRITING, { src, name: name || '' })
}
