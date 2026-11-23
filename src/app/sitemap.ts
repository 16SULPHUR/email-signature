import type { MetadataRoute } from 'next'

import { getTemplates } from '@/lib/server/templates'
import { ROLES } from '@/lib/signature/roles'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sigrio.ankit.ninja').replace(/\/$/, '')
  const templates = await getTemplates()
  return [
    { url: base },
    { url: `${base}/templates` },
    ...ROLES.map((r) => ({ url: `${base}/signatures/${r.slug}` })),
    ...templates.map((t) => ({ url: `${base}/templates/${t.id}` })),
  ]
}
