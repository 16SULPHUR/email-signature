import * as si from 'simple-icons'

type IconShape = { kind: 'fill' | 'stroke'; body: string }

const SIMPLE: Record<string, string> = {
  x: 'siX',
  github: 'siGithub',
  instagram: 'siInstagram',
  facebook: 'siFacebook',
  youtube: 'siYoutube',
  tiktok: 'siTiktok',
  whatsapp: 'siWhatsapp',
  telegram: 'siTelegram',
  threads: 'siThreads',
  bluesky: 'siBluesky',
  mastodon: 'siMastodon',
  dribbble: 'siDribbble',
  behance: 'siBehance',
  medium: 'siMedium',
  substack: 'siSubstack',
  pinterest: 'siPinterest',
  discord: 'siDiscord',
  reddit: 'siReddit',
  twitch: 'siTwitch',
  spotify: 'siSpotify',
  snapchat: 'siSnapchat',
  vimeo: 'siVimeo',
  stackoverflow: 'siStackoverflow',
  calendly: 'siCalendly',
  linktree: 'siLinktree',
  patreon: 'siPatreon',
  kofi: 'siKofi',
  etsy: 'siEtsy',
  yelp: 'siYelp',
  producthunt: 'siProducthunt',
  appstore: 'siAppstore',
  googleplay: 'siGoogleplay',
}

const CUSTOM: Record<string, IconShape> = {
  linkedin: {
    kind: 'fill',
    body: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>',
  },
  phone: {
    kind: 'stroke',
    body: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  },
  mobile: {
    kind: 'stroke',
    body: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  },
  email: {
    kind: 'stroke',
    body: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  },
  website: {
    kind: 'stroke',
    body: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  },
  address: {
    kind: 'stroke',
    body: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  },
  link: {
    kind: 'stroke',
    body: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  },
  calendar: {
    kind: 'stroke',
    body: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  },
}

export function getIconShape(name: string): IconShape | null {
  if (CUSTOM[name]) return CUSTOM[name]
  const key = SIMPLE[name]
  const icon = key ? (si as unknown as Record<string, { path: string }>)[key] : undefined
  return icon ? { kind: 'fill', body: `<path d="${icon.path}"/>` } : null
}

export function iconSvg(
  name: string,
  { color, bg, size, radius }: { color: string; bg?: string; size: number; radius: number },
): string | null {
  const shape = getIconShape(name)
  if (!shape) return null
  const paint =
    shape.kind === 'fill'
      ? `fill="#${color}"`
      : `fill="none" stroke="#${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
  const inner = bg
    ? `<rect width="24" height="24" rx="${(radius / 100) * 24}" fill="#${bg}"/><g transform="translate(5.5 5.5) scale(0.5417)" ${paint}>${shape.body}</g>`
    : `<g ${paint}>${shape.body}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">${inner}</svg>`
}
