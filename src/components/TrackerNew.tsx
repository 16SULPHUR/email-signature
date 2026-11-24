'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { TrackerNotice } from '@/components/TrackerNotice'
import { api, type SavedSignature, useSession } from '@/lib/client/api'
import { copyRich, copyRichLater } from '@/lib/client/copy'
import { pixelHtml } from '@/lib/client/tracking'
import { renderSignature } from '@/lib/signature/render'
import type { Template } from '@/lib/signature/types'
import { siteUrl } from '@/lib/site'

export function TrackerNew({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const user = useSession()
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [subject, setSubject] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [sigId, setSigId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ id: string; html: string; withSignature: boolean; copiedOk: boolean }>()
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (user) api.listSignatures().then((r) => setSaved(r.docs)).catch(() => {})
  }, [user, router])

  if (!user) return null

  const flash = (m: string) => {
    setCopied(m)
    setTimeout(() => setCopied(''), 2500)
  }

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const sig = saved.find((s) => String(s.id) === sigId)
    const tpl = sig && templates.find((t) => t.id === sig.template)
    if (sig && !tpl) {
      setError('That signature uses a template that is no longer available.')
      setBusy(false)
      return
    }
    let created = ''
    const htmlPromise = api.createTracked({ subject, recipientName, recipientEmail }).then(({ id }) => {
      created = id
      return (sig && tpl ? renderSignature(tpl, sig.data, siteUrl()) : '') + pixelHtml(id)
    })
    try {
      const ok = await copyRichLater(htmlPromise)
      const html = await htmlPromise
      setDone({ id: created, html, withSignature: Boolean(sig), copiedOk: ok })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="tracker tracker--narrow">
        <div className="account__head">
          <div>
            <h1>Ready to send</h1>
            <p className="hint">
              {done.copiedOk
                ? `${done.withSignature ? 'Signature and tracking pixel' : 'Tracking pixel'} copied to your clipboard.`
                : 'Your browser blocked copying. Use the button below to copy it.'}
            </p>
          </div>
        </div>
        <div className="panel tracker__steps">
          <ol>
            <li>Open your email and write the message.</li>
            <li>Paste at the very end of the body. The pixel is invisible.</li>
            <li>Send it. The opens will show up on its detail page.</li>
          </ol>
          <div className="tracker__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={async () => {
                await copyRich(done.html)
                flash('Copied again')
              }}
            >
              {done.withSignature ? 'Copy signature + pixel' : 'Copy pixel'}
            </button>
            {done.withSignature && (
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  await copyRich(pixelHtml(done.id))
                  flash('Pixel copied')
                }}
              >
                Copy pixel only
              </button>
            )}
            {copied && <span className="hint">{copied}</span>}
          </div>
        </div>
        <div className="tracker__actions">
          <Link href={`/track/${done.id}`} className="btn">
            Open details
          </Link>
          <Link href="/track" className="btn btn--text">
            Back to all tracked emails
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tracker tracker--narrow">
      <div className="account__head">
        <div>
          <h1>New tracked email</h1>
          <p className="hint">
            <Link href="/track">Tracked emails</Link> / New
          </p>
        </div>
      </div>

      <form className="panel tracker__form" onSubmit={create}>
        <div className="fields">
          <div className="field field--wide">
            <label htmlFor="tr-subject">Subject or note</label>
            <input id="tr-subject" className="input" required maxLength={300} autoFocus value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Proposal for Acme" />
          </div>
          <div className="field">
            <label htmlFor="tr-name">Recipient name</label>
            <input id="tr-name" className="input" maxLength={200} autoComplete="off" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tr-email">Recipient email</label>
            <input id="tr-email" type="email" className="input" maxLength={200} autoComplete="off" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
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
          Each tracked email gets its own invisible pixel, so create one per email you send. Recipient details stay
          with your account.
        </p>
        {error && <p className="error">{error}</p>}
        <div className="tracker__actions">
          <button className="btn btn--primary" disabled={busy}>
            Create and copy
          </button>
          <Link href="/track" className="btn btn--text">
            Cancel
          </Link>
        </div>
      </form>

      <TrackerNotice />
    </div>
  )
}
