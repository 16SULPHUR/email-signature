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

type Opts = { kind: string; media: string; tone: string; sort: string }

const lum = (hex: string) => {
  const c = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) || 0)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

const isAnimated = (t: Template) => !!(t.animated || t.animation)

function matches(t: Template, o: Opts) {
  if (o.kind === 'animated' && !isAnimated(t)) return false
  if (o.kind === 'static' && isAnimated(t)) return false
  if (o.media === 'photo' && !t.fields.includes('photoUrl')) return false
  if (o.media === 'logo' && !t.fields.includes('logoUrl')) return false
  if (o.tone !== 'any') {
    const dark = lum(t.theme.bg) < 0.45
    if ((o.tone === 'dark') !== dark) return false
  }
  return true
}

function sorted(list: Template[], sort: string) {
  const out = [...list]
  if (sort === 'az') out.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === 'za') out.sort((a, b) => b.name.localeCompare(a.name))
  if (sort === 'animated') out.sort((a, b) => Number(isAnimated(b)) - Number(isAnimated(a)))
  return out
}

const DEFAULTS: Opts = { kind: 'all', media: 'any', tone: 'any', sort: 'featured' }

export function Gallery({
  templates,
  categories,
}: {
  templates: Template[]
  categories: string[]
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [opts, setOpts] = useState<Opts>(DEFAULTS)
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<Opts>) => setOpts((o) => ({ ...o, ...patch }))
  const active = (Object.keys(DEFAULTS) as (keyof Opts)[]).filter(
    (k) => opts[k] !== DEFAULTS[k],
  ).length

  const filtered = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    const list = templates.filter((t) => {
      if (category !== 'all' && t.category !== category) return false
      if (!matches(t, opts)) return false
      const hay = [t.name, t.category, categoryLabel(t.category), t.description, ...t.tags]
        .join(' ')
        .toLowerCase()
      return words.every((w) => hay.includes(w) || (SYNONYMS[w] && hay.includes(SYNONYMS[w])))
    })
    return sorted(list, opts.sort)
  }, [templates, query, category, opts])

  const previews = useMemo(
    () => Object.fromEntries(templates.map((t) => [t.id, renderSignature(t, previewData(t), '')])),
    [templates],
  )

  return (
    <section className="gallery">
      <div className="gallery__controls">
        <div className="gallery__bar">
          <div className="gallery__search-wrap">
            <input
              type="search"
              className="input gallery__search"
              placeholder="search role or industry"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search templates"
            />
          </div>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Filters{active ? ` (${active})` : ''}
          </button>
        </div>
        {open && (
          <div className="filters">
            <Select
              label="type"
              value={opts.kind}
              onChange={(kind) => set({ kind })}
              options={[
                ['all', 'All'],
                ['animated', 'Animated'],
                ['static', 'Static'],
              ]}
            />
            <Select
              label="shows"
              value={opts.media}
              onChange={(media) => set({ media })}
              options={[
                ['any', 'Any'],
                ['photo', 'Photo'],
                ['logo', 'Logo'],
              ]}
            />
            <Select
              label="look"
              value={opts.tone}
              onChange={(tone) => set({ tone })}
              options={[
                ['any', 'Any'],
                ['light', 'Light'],
                ['dark', 'Dark'],
              ]}
            />
            <Select
              label="sort"
              value={opts.sort}
              onChange={(sort) => set({ sort })}
              options={[
                ['featured', 'Featured'],
                ['animated', 'Animated first'],
                ['az', 'A to Z'],
                ['za', 'Z to A'],
              ]}
            />
            {active > 0 && (
              <button
                type="button"
                className="btn btn--sm btn--text"
                onClick={() => setOpts(DEFAULTS)}
              >
                Reset
              </button>
            )}
          </div>
        )}
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
        <p className="empty">No matching templates.</p>
      ) : (
        <div className="grid">
          {filtered.map((t) => (
            <TemplateCard key={t.id} t={t} html={previews[t.id]} />
          ))}
        </div>
      )}
    </section>
  )
}

export function TemplateCard({ t, html }: { t: Template; html: string }) {
  return (
    <Link href={`/templates/${t.id}`} className="card">
      <div className="card__bar">
        <span>{t.name}</span>
        <span className="tag">{categoryLabel(t.category).toLowerCase()}</span>
      </div>
      <div className="card__stage">
        <SignatureFrame html={html} fit />
      </div>
    </Link>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[][]
}) {
  return (
    <label className="field field--inline">
      <span>{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}
