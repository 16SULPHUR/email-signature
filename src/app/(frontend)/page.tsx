import Link from 'next/link'

import { HeroStage } from '@/components/HeroStage'
import { TemplateCard } from '@/components/Gallery'
import { getTemplates } from '@/lib/server/templates'
import { previewData } from '@/lib/signature/preview'
import { renderSignature } from '@/lib/signature/render'

export const revalidate = 60

const FEATURED = ['terminal-dev', 'counsel-classic', 'studio-block', 'realtor-card', 'boardroom', 'classic-photo']

export default async function HomePage() {
  const templates = await getTemplates()
  const featured = [
    ...FEATURED.map((id) => templates.find((t) => t.id === id)).filter((t) => !!t),
    ...templates,
  ]
    .filter((t, i, a) => a.indexOf(t) === i)
    .slice(0, 6)

  return (
    <>
      <section className="hero">
        <div>
          <h1>
            Email signatures <mark>built for your job</mark>
            <span className="cursor" />
          </h1>
          <p className="hero__lede">Pick a template, add your details, paste it into your email.</p>
          <div className="hero__cta">
            <Link href="/templates" className="btn btn--primary">
              Browse {templates.length} templates →
            </Link>
          </div>
        </div>
        <HeroStage templates={templates} />
      </section>
      <section className="gallery">
        <div className="grid">
          {featured.map((t) => (
            <TemplateCard key={t.id} t={t} html={renderSignature(t, previewData(t), '')} />
          ))}
        </div>
        <div className="more">
          <Link href="/templates" className="btn">
            View all templates →
          </Link>
        </div>
      </section>
    </>
  )
}
