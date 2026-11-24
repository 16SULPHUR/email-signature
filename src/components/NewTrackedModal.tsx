'use client'

import { useEffect, useRef, useState } from 'react'

import { api, type SavedSignature } from '@/lib/client/api'
import { copyRich, copyText } from '@/lib/client/copy'
import { pixelHtml } from '@/lib/client/tracking'
import { renderSignature } from '@/lib/signature/render'
import { siteUrl } from '@/lib/site'
import type { Template } from '@/lib/signature/types'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
  templates: Template[]
  saved: SavedSignature[]
}

export function NewTrackedModal({ open, onClose, onCreated, templates, saved }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [subject, setSubject] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sigId, setSigId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<{ id: string; withSignature: boolean; copied: boolean }>()
  const [copiedNow, setCopiedNow] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const reset = () => {
    setSubject('')
    setRecipientName('')
    setRecipientEmail('')
    setSigId('')
    setError('')
    setCreated(undefined)
    setCopiedNow(false)
  }

  const close = () => {
    onClose()
    reset()
  }

  const htmlFor = (id: string) => {
    const sig = saved.find((s) => String(s.id) === sigId)
    const tpl = sig && templates.find((t) => t.id === sig.template)
    return (sig && tpl ? renderSignature(tpl, sig.data, siteUrl()) : '') + pixelHtml(id)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { id } = await api.createTracked({ subject, recipientName, recipientEmail })
      const withSignature = Boolean(sigId)
      const copied = await copyRich(htmlFor(id)).catch(() => false)
      setCopiedNow(copied)
      setCreated({ id, withSignature, copied })
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={ref} className="modal" onClose={close} onClick={(e) => e.target === ref.current && close()}>
      {created ? (
        <div className="modal__body">
          <h2>{copiedNow ? 'Copied to your clipboard' : 'Tracker created'}</h2>
          <p className="hint">
            {copiedNow
              ? 'Paste it at the very end of your email, then send as usual.'
              : 'Your browser blocked the automatic copy. Press the button below to copy, then paste it at the very end of your email.'}{' '}
            {created.withSignature ? 'Includes your signature and its tracking pixel.' : 'Includes the tracking pixel.'}
          </p>
          <div className="modal__actions">
            <button
              type="button"
              className={`btn${copiedNow ? ' btn--sm' : ' btn--primary'}`}
              onClick={async () => setCopiedNow(await copyRich(htmlFor(created.id)))}
            >
              {copiedNow ? 'Copy again' : created.withSignature ? 'Copy signature + pixel' : 'Copy pixel'}
            </button>
            <button type="button" className="btn btn--sm" onClick={() => copyText(htmlFor(created.id))}>
              Copy as HTML code
            </button>
            <button type="button" className={`btn${copiedNow ? ' btn--primary' : ''}`} onClick={close}>
              Done
            </button>
          </div>
        </div>
      ) : (
        <form className="modal__body" onSubmit={submit}>
          <div className="modal__head">
            <h2>Track a new email</h2>
            <button type="button" className="btn btn--text btn--sm" onClick={close} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="field">
            <label htmlFor="tr-subject">Subject or note</label>
            <input
              id="tr-subject"
              className="input"
              required
              autoFocus
              maxLength={300}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Proposal for Acme"
            />
          </div>
          <div className="modal__pair">
            <div className="field">
              <label htmlFor="tr-name">Recipient name</label>
              <input id="tr-name" className="input" maxLength={200} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="tr-email">Recipient email</label>
              <input id="tr-email" type="email" className="input" maxLength={200} value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="tr-sig">Include a saved signature</label>
            <select id="tr-sig" className="input" value={sigId} onChange={(e) => setSigId(e.target.value)}>
              <option value="">Tracking pixel only</option>
              {saved.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <p className="hint">
            Each email gets its own invisible pixel. Recipient details stay with your account and are never shown to anyone else.
          </p>
          {error && <p className="modal__error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={close}>
              Cancel
            </button>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create and copy'}
            </button>
          </div>
        </form>
      )}
    </dialog>
  )
}
