import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Editor } from '@/components/Editor'
import { SITE_NAME } from '@/lib/site'
import { getTemplateById, getTemplates } from '@/lib/server/templates'
import { categoryLabel } from '@/lib/signature/templates'

type Params = { params: Promise<{ id: string }> }

export const revalidate = 60

export const generateStaticParams = async () => (await getTemplates()).map((t) => ({ id: t.id }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = await getTemplateById((await params).id)
  if (!t) return {}
  return {
    title: `${t.name} email signature for ${categoryLabel(t.category).toLowerCase()} · ${SITE_NAME}`,
    description: t.description,
  }
}

export default async function TemplatePage({ params }: Params) {
  const [template, all] = await Promise.all([getTemplateById((await params).id), getTemplates()])
  if (!template) notFound()
  return (
    <Suspense>
      <Editor template={template} templates={all.map(({ id, name }) => ({ id, name }))} />
    </Suspense>
  )
}
