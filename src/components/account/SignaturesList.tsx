'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { SignatureFrame } from '@/components/SignatureFrame'
import { PageHead } from '@/components/account/AccountShell'
import { api, type SavedSignature } from '@/lib/client/api'
import { renderSignature } from '@/lib/signature/render'
import type { Template } from '@/lib/signature/types'

export function SignaturesList({ templates }: { templates: Template[] }) {
  const [items, setItems] = useState<SavedSignature[]>()

  useEffect(() => {
    api.listSignatures().then((r) => setItems(r.docs))
  }, [])

  const remove = async (id: SavedSignature['id']) => {
    if (!window.confirm('Delete this saved signature?')) return
    await api.deleteSignature(id)
    setItems((list) => list?.filter((s) => s.id !== id))
  }

  return (
    <>
      <PageHead title="Signatures" />

      {items?.length === 0 && (
        <p className="empty">
          Nothing saved yet. <Link href="/templates">Pick a template</Link> and click Save to account.
        </p>
      )}

      <div className="grid">
        {items?.map((s) => {
          const t = templates.find((x) => x.id === s.template)
          return (
            <article key={s.id} className="card">
              <div className="card__stage">{t && <SignatureFrame html={renderSignature(t, s.data, '')} fit />}</div>
              <div className="card__meta">
                <div>
                  <h3>
                    <Link href={`/templates/${s.template}?sig=${s.id}`} className="card__link">
                      {s.name}
                    </Link>
                  </h3>
                  <p>
                    {t?.name || s.template} · updated {new Date(s.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <button type="button" className="btn btn--text btn--sm card__action" onClick={() => remove(s.id)}>
                  Delete
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
