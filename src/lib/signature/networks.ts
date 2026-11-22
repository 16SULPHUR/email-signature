export type Network = {
  id: string
  label: string
  color: string
  placeholder: string
}

export const NETWORKS: Network[] = [
  { id: 'linkedin', label: 'LinkedIn', color: '0A66C2', placeholder: 'https://linkedin.com/in/you' },
  { id: 'x', label: 'X (Twitter)', color: '000000', placeholder: 'https://x.com/you' },
  { id: 'github', label: 'GitHub', color: '181717', placeholder: 'https://github.com/you' },
  { id: 'instagram', label: 'Instagram', color: 'E4405F', placeholder: 'https://instagram.com/you' },
  { id: 'facebook', label: 'Facebook', color: '0866FF', placeholder: 'https://facebook.com/you' },
  { id: 'youtube', label: 'YouTube', color: 'FF0000', placeholder: 'https://youtube.com/@you' },
  { id: 'tiktok', label: 'TikTok', color: '000000', placeholder: 'https://tiktok.com/@you' },
  { id: 'whatsapp', label: 'WhatsApp', color: '25D366', placeholder: 'https://wa.me/15550102030' },
  { id: 'telegram', label: 'Telegram', color: '26A5E4', placeholder: 'https://t.me/you' },
  { id: 'threads', label: 'Threads', color: '000000', placeholder: 'https://threads.net/@you' },
  { id: 'bluesky', label: 'Bluesky', color: '1185FE', placeholder: 'https://bsky.app/profile/you' },
  { id: 'mastodon', label: 'Mastodon', color: '6364FF', placeholder: 'https://mastodon.social/@you' },
  { id: 'dribbble', label: 'Dribbble', color: 'EA4C89', placeholder: 'https://dribbble.com/you' },
  { id: 'behance', label: 'Behance', color: '1769FF', placeholder: 'https://behance.net/you' },
  { id: 'medium', label: 'Medium', color: '000000', placeholder: 'https://medium.com/@you' },
  { id: 'substack', label: 'Substack', color: 'FF6719', placeholder: 'https://you.substack.com' },
  { id: 'pinterest', label: 'Pinterest', color: 'BD081C', placeholder: 'https://pinterest.com/you' },
  { id: 'discord', label: 'Discord', color: '5865F2', placeholder: 'https://discord.gg/invite' },
  { id: 'reddit', label: 'Reddit', color: 'FF4500', placeholder: 'https://reddit.com/u/you' },
  { id: 'twitch', label: 'Twitch', color: '9146FF', placeholder: 'https://twitch.tv/you' },
  { id: 'spotify', label: 'Spotify', color: '1ED760', placeholder: 'https://open.spotify.com/…' },
  { id: 'snapchat', label: 'Snapchat', color: 'FFFC00', placeholder: 'https://snapchat.com/add/you' },
  { id: 'vimeo', label: 'Vimeo', color: '1AB7EA', placeholder: 'https://vimeo.com/you' },
  { id: 'stackoverflow', label: 'Stack Overflow', color: 'F58025', placeholder: 'https://stackoverflow.com/users/…' },
  { id: 'calendly', label: 'Calendly', color: '006BFF', placeholder: 'https://calendly.com/you' },
  { id: 'linktree', label: 'Linktree', color: '43E55E', placeholder: 'https://linktr.ee/you' },
  { id: 'patreon', label: 'Patreon', color: '000000', placeholder: 'https://patreon.com/you' },
  { id: 'kofi', label: 'Ko-fi', color: 'FF5E5B', placeholder: 'https://ko-fi.com/you' },
  { id: 'etsy', label: 'Etsy', color: 'F16521', placeholder: 'https://etsy.com/shop/you' },
  { id: 'yelp', label: 'Yelp', color: 'FF1A1A', placeholder: 'https://yelp.com/biz/you' },
  { id: 'producthunt', label: 'Product Hunt', color: 'DA552F', placeholder: 'https://producthunt.com/@you' },
  { id: 'appstore', label: 'App Store', color: '0D96F6', placeholder: 'https://apps.apple.com/…' },
  { id: 'googleplay', label: 'Google Play', color: '414141', placeholder: 'https://play.google.com/…' },
  { id: 'website', label: 'Website', color: '475569', placeholder: 'https://you.com' },
  { id: 'link', label: 'Other link', color: '475569', placeholder: 'https://…' },
]

export const NETWORK_MAP = Object.fromEntries(NETWORKS.map((n) => [n.id, n]))
