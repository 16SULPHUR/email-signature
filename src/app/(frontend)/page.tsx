import { Gallery } from '@/components/Gallery'
import { CATEGORIES, TEMPLATES } from '@/lib/signature/templates'

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>
          Email signatures that look <em>made for your job</em>
        </h1>
        <p>
          Browse {TEMPLATES.length} templates for developers, lawyers, realtors, doctors, creators and more. Fill in
          your details, tweak colors and links, then copy it straight into Gmail or Outlook. No signup.
        </p>
      </section>
      <Gallery templates={TEMPLATES} categories={CATEGORIES} />
    </>
  )
}
