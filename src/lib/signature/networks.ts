export type Network = {
  id: string
  label: string
  color: string
  placeholder: string
  base?: string
  hint?: string
}

export const NETWORKS: Network[] = [
  { id: 'linkedin', label: 'LinkedIn', color: '0A66C2', placeholder: 'https://linkedin.com/in/you', base: 'https://linkedin.com/in/', hint: 'username' },
  { id: 'x', label: 'X (Twitter)', color: '000000', placeholder: 'https://x.com/you', base: 'https://x.com/', hint: 'username' },
  { id: 'github', label: 'GitHub', color: '181717', placeholder: 'https://github.com/you', base: 'https://github.com/', hint: 'username' },
  { id: 'instagram', label: 'Instagram', color: 'E4405F', placeholder: 'https://instagram.com/you', base: 'https://instagram.com/', hint: 'username' },
  { id: 'facebook', label: 'Facebook', color: '0866FF', placeholder: 'https://facebook.com/you', base: 'https://facebook.com/', hint: 'username' },
  { id: 'youtube', label: 'YouTube', color: 'FF0000', placeholder: 'https://youtube.com/@you', base: 'https://youtube.com/@', hint: 'channel handle' },
  { id: 'tiktok', label: 'TikTok', color: '000000', placeholder: 'https://tiktok.com/@you', base: 'https://tiktok.com/@', hint: 'username' },
  { id: 'whatsapp', label: 'WhatsApp', color: '25D366', placeholder: 'https://wa.me/15550102030', base: 'https://wa.me/', hint: 'phone with country code' },
  { id: 'telegram', label: 'Telegram', color: '26A5E4', placeholder: 'https://t.me/you', base: 'https://t.me/', hint: 'username' },
  { id: 'threads', label: 'Threads', color: '000000', placeholder: 'https://threads.net/@you', base: 'https://threads.net/@', hint: 'username' },
  { id: 'bluesky', label: 'Bluesky', color: '1185FE', placeholder: 'https://bsky.app/profile/you', base: 'https://bsky.app/profile/', hint: 'handle.bsky.social' },
  { id: 'mastodon', label: 'Mastodon', color: '6364FF', placeholder: 'https://mastodon.social/@you' },
  { id: 'dribbble', label: 'Dribbble', color: 'EA4C89', placeholder: 'https://dribbble.com/you', base: 'https://dribbble.com/', hint: 'username' },
  { id: 'behance', label: 'Behance', color: '1769FF', placeholder: 'https://behance.net/you', base: 'https://behance.net/', hint: 'username' },
  { id: 'medium', label: 'Medium', color: '000000', placeholder: 'https://medium.com/@you', base: 'https://medium.com/@', hint: 'username' },
  { id: 'substack', label: 'Substack', color: 'FF6719', placeholder: 'https://you.substack.com' },
  { id: 'pinterest', label: 'Pinterest', color: 'BD081C', placeholder: 'https://pinterest.com/you', base: 'https://pinterest.com/', hint: 'username' },
  { id: 'discord', label: 'Discord', color: '5865F2', placeholder: 'https://discord.gg/invite' },
  { id: 'reddit', label: 'Reddit', color: 'FF4500', placeholder: 'https://reddit.com/u/you', base: 'https://reddit.com/u/', hint: 'username' },
  { id: 'twitch', label: 'Twitch', color: '9146FF', placeholder: 'https://twitch.tv/you', base: 'https://twitch.tv/', hint: 'username' },
  { id: 'spotify', label: 'Spotify', color: '1ED760', placeholder: 'https://open.spotify.com/…' },
  { id: 'snapchat', label: 'Snapchat', color: 'FFFC00', placeholder: 'https://snapchat.com/add/you', base: 'https://snapchat.com/add/', hint: 'username' },
  { id: 'vimeo', label: 'Vimeo', color: '1AB7EA', placeholder: 'https://vimeo.com/you', base: 'https://vimeo.com/', hint: 'username' },
  { id: 'stackoverflow', label: 'Stack Overflow', color: 'F58025', placeholder: 'https://stackoverflow.com/users/…' },
  { id: 'calendly', label: 'Calendly', color: '006BFF', placeholder: 'https://calendly.com/you', base: 'https://calendly.com/', hint: 'username' },
  { id: 'linktree', label: 'Linktree', color: '43E55E', placeholder: 'https://linktr.ee/you', base: 'https://linktr.ee/', hint: 'username' },
  { id: 'patreon', label: 'Patreon', color: '000000', placeholder: 'https://patreon.com/you', base: 'https://patreon.com/', hint: 'username' },
  { id: 'kofi', label: 'Ko-fi', color: 'FF5E5B', placeholder: 'https://ko-fi.com/you', base: 'https://ko-fi.com/', hint: 'username' },
  { id: 'etsy', label: 'Etsy', color: 'F16521', placeholder: 'https://etsy.com/shop/you' },
  { id: 'yelp', label: 'Yelp', color: 'FF1A1A', placeholder: 'https://yelp.com/biz/you' },
  { id: 'producthunt', label: 'Product Hunt', color: 'DA552F', placeholder: 'https://producthunt.com/@you', base: 'https://producthunt.com/@', hint: 'username' },
  { id: 'appstore', label: 'App Store', color: '0D96F6', placeholder: 'https://apps.apple.com/…' },
  { id: 'googleplay', label: 'Google Play', color: '414141', placeholder: 'https://play.google.com/…' },
  { id: 'website', label: 'Website', color: '475569', placeholder: 'https://you.com' },
  { id: 'link', label: 'Other link', color: '475569', placeholder: 'https://…' },
]

export const NETWORK_MAP = Object.fromEntries(NETWORKS.map((n) => [n.id, n]))

export const displayHandle = (n: Network | undefined, url: string) =>
  n?.base && url.toLowerCase().startsWith(n.base) ? url.slice(n.base.length) : url

const bare = (u: string) => u.replace(/^https?:\/\/(www\.)?/i, '').toLowerCase()

export function buildLink(n: Network | undefined, input: string) {
  const v = input.trim()
  if (!n?.base || !v) return v
  const stripped = bare(v)
  const stem = bare(n.base)
  if (stripped.startsWith(stem)) return n.base + v.slice(v.length - (stripped.length - stem.length))
  if (v.includes('/')) return v
  const handle = n.id === 'whatsapp' ? v.replace(/\D/g, '') : v.replace(/^@/, '')
  return n.base + handle
}
