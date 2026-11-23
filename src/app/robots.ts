import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sigrio.ankit.ninja').replace(/\/$/, '')
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/account', '/share', '/upload', '/collect'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
