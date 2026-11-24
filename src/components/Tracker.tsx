'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { api, type SavedSignature, type TrackedDetail, type TrackedEmail, useSession } from '@/lib/client/api'
import { copyRich } from '@/lib/client/copy'
import { renderSignature } from '@/lib/signature/render'
import { siteUrl } from '@/lib/site'
import type { Template } from '@/lib/signature/types'

const pixelHtml = (id: string) =>
  `<img src="${siteUrl()}/t/${id}.gif" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`

const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return `${Math.round(s / 86400)} d ago`
}

function Detail({ id }: { id: string }) {
  const [detail, setDetail] = useState<TrackedDetail>()
  useEffect(() => {
    api.getTracked(id).then(setDetail).catch(() => {})
  }, [id])
  if (!detail) return <p className="hint">Loading…</p>
  if (!detail.opens.length) return <p className="hint">No opens recorded yet.</p>
  return (
    <table className="tracker__opens">
      <thead>
        <tr>
          <th>When</th>
          <th>Device</th>
          <th>Where</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {detail.opens.map((o, i) => (
          <tr key={i} className={o.kind === 'bot' ? 'tracker__muted' : undefined}>
            <td>{new Date(o.opened_at).toLocaleString()}</td>
            <td>{o.device || 'Unknown'}</td>
            <td>{[o.city, o.country].filter(Boolean).join(', ') || 'Hidden'}</td>
            <td>{o.kind === 'bot' ? 'Scanner (not counted)' : o.kind === 'proxy' ? 'Via Gmail proxy' : 'Direct'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Tracker({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const user = useSession()
  const [items, setItems] = useState<TrackedEmail[]>()
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [subject, setSubject] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sigId, setSigId] = useState('')
  const [open, setOpen] = useState<string>()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => api.listTracked().then((r) => setItems(r.docs)).catch(() => {}), [])

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    load()
    api.listSignatures().then((r) => setSaved(r.docs)).catch(() => {})
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [user, router, load])

  if (!user) return null

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const { id } = await api.createTracked({ subject, recipientName, recipientEmail })
      const sig = saved.find((s) => String(s.id) === sigId)
      const tpl = sig && templates.find((t) => t.id === sig.template)
      const html = (sig && tpl ? renderSignature(tpl, sig.data, siteUrl()) : '') + pixelHtml(id)
      await copyRich(html)
      setMsg(
        sig
          ? 'Copied the signature with its tracking pixel. Paste it at the end of your email.'
          : 'Copied the tracking pixel. Paste it at the end of your email.',
      )
      setSubject('')
      setRecipientName('')
      setRecipientEmail('')
      await load()
    } catch (err) {
      setMsg((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm('Delete this tracked email and its open history?')) return
    await api.deleteTracked(id)
    setItems((list) => list?.filter((t) => t.id !== id))
  }

  return (
    <div className="tracker">
      <div className="account__head">
        <div>
          <h1>Tracked emails</h1>
          <p className="hint">See which emails were opened, by whom, and when.</p>
        </div>
      </div>

      <form className="panel tracker__form" onSubmit={create}>
        <h2>Track a new email</h2>
        <div className="fields">
          <div className="field field--wide">
            <label htmlFor="tr-subject">Subject or note</label>
            <input id="tr-subject" className="input" required maxLength={300} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Proposal for Acme" />
          </div>
          <div className="field">
            <label htmlFor="tr-name">Recipient name</label>
            <input id="tr-name" className="input" maxLength={200} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tr-email">Recipient email</label>
            <input id="tr-email" type="email" className="input" maxLength={200} value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
          </div>
          <div className="field field--wide">
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
        </div>
        <p className="hint">
          Each tracked email gets its own invisible pixel. Create one per email you send, then paste it at the end of
          the message. Recipient details stay with your account and are never shown to anyone else.
        </p>
        {msg && <p className="hint">{msg}</p>}
        <button className="btn btn--primary" disabled={busy}>
          Create and copy
        </button>
      </form>

      <p className="hint hint--warn">
        Opens are approximate. Apple Mail and some other apps load images automatically, which can show an open that
        nobody made, and recipients who block images are never counted. An open does not prove the email was read.
        Tell your recipients you use tracking where the law requires it. See the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      {items?.length === 0 && <p className="empty">No tracked emails yet.</p>}

      <div className="tracker__list">
        {items?.map((t) => (
          <article key={t.id} className="panel tracker__item">
            <div className="tracker__row">
              <div>
                <h3>{t.subject}</h3>
                <p className="hint">
                  {t.recipient_name || t.recipient_email
                    ? `To ${[t.recipient_name, t.recipient_email && `<${t.recipient_email}>`].filter(Boolean).join(' ')}`
                    : 'No recipient set'}{' '}
                  · created {ago(t.created_at)}
                </p>
              </div>
              <span className={`tracker__status${t.open_count ? ' tracker__status--on' : ''}`}>
                {t.open_count
                  ? `Opened${t.open_count > 1 ? ` ×${t.open_count}` : ''} · ${ago(t.last_opened_at!)}`
                  : 'Not opened'}
              </span>
            </div>
            <div className="tracker__actions">
              <button
                type="button"
                className="btn btn--sm"
                onClick={async () => {
                  await copyRich(pixelHtml(t.id))
                  setMsg('Copied the tracking pixel.')
                }}
              >
                Copy pixel
              </button>
              <button type="button" className="btn btn--sm" onClick={() => setOpen(open === t.id ? undefined : t.id)}>
                {open === t.id ? 'Hide opens' : 'Show opens'}
              </button>
              <button type="button" className="btn btn--text btn--sm" onClick={() => remove(t.id)}>
                Delete
              </button>
            </div>
            {open === t.id && <Detail id={t.id} />}
          </article>
        ))}
      </div>
    </div>
  )
}
