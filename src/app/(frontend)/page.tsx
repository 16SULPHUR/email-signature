import { Gallery } from '@/components/Gallery'
import { HeroStage } from '@/components/HeroStage'
import { getTemplates } from '@/lib/server/templates'
import { categoriesOf } from '@/lib/signature/templates'

export const revalidate = 60

export default async function HomePage() {
  const TEMPLATES = await getTemplates()
  const CATEGORIES = categoriesOf(TEMPLATES)
  return (
    <>
      <section className="hero">
        <div>
          <p className="hero__prompt">
            <b>~/sigrio</b> $ new --signature --free
          </p>
          <h1>
            Email signatures <mark>built for your job</mark>
            <span className="cursor" />
          </h1>
          <p className="hero__lede">
            Pick a template for developers, lawyers, realtors, doctors, creators and more. Fill in your details, tweak
            the colors, paste it into Gmail or Outlook.
          </p>
          <div className="hero__cta">
            <a href="#templates" className="btn btn--primary">
              Browse templates ↓
            </a>
          </div>
          <div className="hero__stats">
            <span>
              <b>{TEMPLATES.length}</b> templates
            </span>
            <span>
              <b>{CATEGORIES.length}</b> industries
            </span>
            <span>
              <b>0</b> signups required
            </span>
          </div>
        </div>
        <HeroStage templates={TEMPLATES} />
      </section>
      <Gallery templates={TEMPLATES} categories={CATEGORIES} />
    </>
  )
}
