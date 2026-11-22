'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { SignatureFrame } from '@/components/SignatureFrame'
import { previewData } from '@/lib/signature/preview'
import { renderSignature } from '@/lib/signature/render'
import { categoryLabel } from '@/lib/signature/templates'
import type { Template } from '@/lib/signature/types'

const SYNONYMS: Record<string, string> = {
  lawyer: 'legal',
  attorney: 'legal',
  advocate: 'legal',
  doctor: 'healthcare',
  nurse: 'healthcare',
  dentist: 'healthcare',
  medical: 'healthcare',
  realtor: 'real-estate',
  agent: 'real-estate',
  broker: 'real-estate',
  property: 'real-estate',
  engineer: 'developer',
  programmer: 'developer',
  coder: 'developer',
  software: 'developer',
  ceo: 'executive',
  founder: 'startup',
  teacher: 'education',
  professor: 'education',
  student: 'education',
  accountant: 'finance',
  banker: 'finance',
  influencer: 'creator',
  youtuber: 'creator',
  hotel: 'hospitality',
  restaurant: 'hospitality',
  chef: 'hospitality',
  artist: 'designer',
  photographer: 'creator',
}

export function Gallery({ templates, categories }: { templates: Template[]; categories: string[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return templates.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      const hay = [t.name, t.category, categoryLabel(t.category), t.description, ...t.tags].join(' ').toLowerCase()
      return words.every((w) => hay.includes(w) || (SYNONYMS[w] && hay.includes(SYNONYMS[w])))
    })
  }, [templates, query, category])

  const previews = useMemo(
    () => Object.fromEntries(templates.map((t) => [t.id, renderSignature(t, previewData(t), '')])),
    [templates],
  )

  return (
    <section id="templates" className="gallery">
      <div className="gallery__controls">
        <input
          type="search"
          className="input gallery__search"
          placeholder="Search by role, industry or style: lawyer, dark, photo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search templates"
        />
        <div className="chips" role="tablist" aria-label="Categories">
          {['all', ...categories].map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              className={`chip${category === c ? ' chip--on' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'all' ? 'All' : categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No templates match “{query}”. Try a broader word like “photo” or “minimal”.</p>
      ) : (
        <div className="grid">
          {filtered.map((t) => (
            <article key={t.id} className="card">
              <div className="card__stage">
                <SignatureFrame html={previews[t.id]} fit />
              </div>
              <div className="card__meta">
                <div>
                  <h3>
                    <Link href={`/templates/${t.id}`} className="card__link">
                      {t.name}
                    </Link>
                  </h3>
                  <p>{t.description}</p>
                </div>
                <span className="tag">{categoryLabel(t.category)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
