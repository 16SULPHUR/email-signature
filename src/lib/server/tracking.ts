import { headers as getHeaders } from 'next/headers'

import { getPayloadClient } from '@/lib/server/db'

export const TRACKING_LIMITS = {
  perUser: 200,
  perUserPerHour: 50,
  opensPerEmail: 500,
  retentionDays: 180,
}

const BOT = /bot|crawl|spider|scan|preview|barracuda|proofpoint|mimecast|headless|curl|python|go-http|slackbot|facebookexternalhit/i

export function classifyOpen(ua: string) {
  if (/GoogleImageProxy/i.test(ua)) return { kind: 'proxy', device: 'Gmail (image proxy)' }
  if (BOT.test(ua)) return { kind: 'bot', device: 'Automated scanner' }
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'Mac'
          : /Linux/.test(ua)
            ? 'Linux'
            : ''
  const app = /Outlook/i.test(ua)
    ? 'Outlook'
    : /Edg\//.test(ua)
      ? 'Edge'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : ''
  return { kind: 'open', device: [app, os].filter(Boolean).join(' on ') || 'Unknown device' }
}

export async function currentUser() {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await getHeaders() })
  return user
}
