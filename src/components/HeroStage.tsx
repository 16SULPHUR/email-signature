'use client'

import { useEffect, useMemo, useState } from 'react'

import { SignatureFrame } from '@/components/SignatureFrame'
import { previewData } from '@/lib/signature/preview'
import { renderSignature } from '@/lib/signature/render'
import type { Template } from '@/lib/signature/types'

const SHOWN = ['terminal-dev', 'counsel-classic', 'studio-block', 'realtor-card', 'boardroom']

export function HeroStage({ templates }: { templates: Template[] }) {
  const picks = useMemo(() => {
    const byId = SHOWN.map((id) => templates.find((t) => t.id === id)).filter((t): t is Template => !!t)
    return (byId.length >= 3 ? byId : templates.slice(0, 5)).map((t) => ({
      id: t.id,
      name: t.name,
      html: renderSignature(t, previewData(t), ''),
    }))
  }, [templates])
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % picks.length), 3800)
    return () => clearInterval(t)
  }, [picks.length, i])

  const cur = picks[i]
  if (!cur) return null

  return (
    <div className="stage" aria-hidden="true">
      <div className="stage__bar">
        <b>{cur.id}.sig</b>
        <span className="stage__idx">
          {String(i + 1).padStart(2, '0')}/{String(picks.length).padStart(2, '0')}
        </span>
      </div>
      <div className="stage__body">
        <div key={cur.id}>
          <SignatureFrame html={cur.html} fit />
        </div>
      </div>
      <div className="stage__foot">
        {picks.map((p, n) => (
          <button key={p.id} type="button" tabIndex={-1} className={`stage__tick${n === i ? ' on' : ''}`} onClick={() => setI(n)} />
        ))}
      </div>
    </div>
  )
}
