import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Editor } from '@/components/Editor'
import { SITE_NAME } from '@/lib/site'
import { categoryLabel, getTemplate, TEMPLATES } from '@/lib/signature/templates'

type Params = { params: Promise<{ id: string }> }

export const generateStaticParams = () => TEMPLATES.map((t) => ({ id: t.id }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getTemplate((await params).id)
  if (!t) return {}
  return {
    title: `${t.name} email signature for ${categoryLabel(t.category).toLowerCase()} · ${SITE_NAME}`,
    description: t.description,
  }
}

export default async function TemplatePage({ params }: Params) {
  const template = getTemplate((await params).id)
  if (!template) notFound()
  return (
    <Suspense>
      <Editor template={template} templates={TEMPLATES.map(({ id, name }) => ({ id, name }))} />
    </Suspense>
  )
}
