import type { Metadata } from 'next'

import { Gallery } from '@/components/Gallery'
import { getTemplates } from '@/lib/server/templates'
import { categoriesOf } from '@/lib/signature/templates'
import { SITE_NAME } from '@/lib/site'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Email signature templates · ${SITE_NAME}`,
  description: 'Browse email signature templates by role and industry.',
}

export default async function TemplatesPage() {
  const templates = await getTemplates()
  return <Gallery templates={templates} categories={categoriesOf(templates)} />
}
