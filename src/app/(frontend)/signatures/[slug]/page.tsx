import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TemplateCard } from '@/components/Gallery'
import { getTemplates } from '@/lib/server/templates'
import { previewData } from '@/lib/signature/preview'
import { renderSignature } from '@/lib/signature/render'
import { ROLES, roleBySlug } from '@/lib/signature/roles'
import { SITE_NAME } from '@/lib/site'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 60

export const generateStaticParams = () => ROLES.map((r) => ({ slug: r.slug }))

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const role = roleBySlug((await params).slug)
  if (!role) return {}
  return {
    title: `Free email signature for ${role.label} · ${SITE_NAME}`,
    description: `Free email signature templates for ${role.label}. Pick a design, add your details and copy it into Gmail, Outlook or Apple Mail.`,
    alternates: { canonical: `/signatures/${role.slug}` },
  }
}

export default async function RolePage({ params }: Params) {
  const role = roleBySlug((await params).slug)
  if (!role) notFound()
  const all = await getTemplates()
  const matches = all.filter((t) => t.category === role.category)
  const list = matches.length ? matches : all
  return (
    <section className="gallery">
      <div className="page-head">
        <h1>Email signature for {role.label}</h1>
        <p className="hint">
          Pick a design, add your details and copy it into Gmail, Outlook or Apple Mail. Free, no branding.
        </p>
      </div>
      <div className="grid">
        {list.map((t) => (
          <TemplateCard key={t.id} t={t} html={renderSignature(t, previewData(t), '')} />
        ))}
      </div>
      <p className="hint">
        More:{' '}
        {ROLES.filter((r) => r.slug !== role.slug).map((r, i) => (
          <span key={r.slug}>
            {i > 0 && ', '}
            <Link href={`/signatures/${r.slug}`}>{r.label}</Link>
          </span>
        ))}
      </p>
    </section>
  )
}
