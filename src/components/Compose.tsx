'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { TrackerNotice } from '@/components/TrackerNotice'
import { api, type SavedSignature, useSession } from '@/lib/client/api'

type Status = Awaited<ReturnType<typeof api.mailStatus>>

const NOTES: Record<string, string> = {
  connected: 'Gmail connected.',
  denied: 'Gmail was not connected. Allow the "send email" permission and try again.',
  unavailable: 'Sending is not set up on this site yet.',
}

function ComposeInner() {
  const router = useRouter()
  const params = useSearchParams()
  const user = useSession()
  const [status, setStatus] = useState<Status>()
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [to, setTo] = useState('')
  const [toName, setToName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sigId, setSigId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string>()
  const [sent, setSent] = useState<{ id: string; to: string }>()

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    api
      .mailStatus()
      .then(setStatus)
      .catch(() => {})
    api
      .listSignatures()
      .then((r) => {
        setSaved(r.docs)
        if (r.docs[0]) setSigId(String(r.docs[0].id))
      })
      .catch(() => {})
  }, [user, router])

  if (!user) return null

  const note = NOTES[params.get('mail') || '']

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { id } = await api.mailSend({ to, toName, subject, body, signatureId: sigId })
      setSent({ id, to })
    } catch (err) {
      setError((err as Error).message)
      if ((err as { reconnect?: boolean }).reconnect) setStatus((s) => s && { ...s, email: null })
    } finally {
      setBusy(false)
    }
  }

  const showPreview = async () => {
    setError('')
    try {
      setPreview((await api.mailPreview(body, sigId)).html)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const reset = () => {
    setSent(undefined)
    setTo('')
    setToName('')
    setSubject('')
    setBody('')
  }

  const disconnect = async () => {
    await api.mailDisconnect()
    setStatus((s) => s && { ...s, email: null })
  }

  if (sent) {
    return (
      <div className="tracker tracker--narrow">
        <div className="account__head">
          <div>
            <h1>Sent</h1>
            <p className="hint">
              Your email to {sent.to} was sent from {status?.email}. Opens will show up on its
              detail page.
            </p>
          </div>
        </div>
        <div className="tracker__actions">
          <Link href={`/track/${sent.id}`} className="btn btn--primary">
            Open details
          </Link>
          <button type="button" className="btn" onClick={reset}>
            Compose another
          </button>
          <Link href="/track" className="btn btn--text">
            All tracked emails
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tracker tracker--narrow">
      <div className="account__head">
        <div>
          <h1>Compose</h1>
          <p className="hint">
            <Link href="/track">Tracked emails</Link> / Compose
          </p>
        </div>
      </div>

      {note && <p className="hint hint--warn">{note}</p>}

      {!status ? null : !status.email ? (
        <div className="panel tracker__form">
          <h2>Connect Gmail</h2>
          <p className="hint">
            Emails are sent from your own Gmail address and show up in your Sent folder. Sigrio only
            asks for permission to send, it cannot read your inbox. You can disconnect any time.
          </p>
          <div className="tracker__actions">
            {status.available ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  window.location.href = '/api/mail/google/start'
                }}
              >
                Connect Gmail
              </button>
            ) : (
              <p className="hint hint--warn">Sending is not set up on this site yet.</p>
            )}
          </div>
        </div>
      ) : (
        <form className="panel tracker__form" onSubmit={send}>
          <p className="hint">
            From <strong>{status.email}</strong> ·{' '}
            <button type="button" className="btn btn--text" onClick={disconnect}>
              Disconnect
            </button>
          </p>
          <div className="fields">
            <div className="field">
              <label htmlFor="cp-to">To</label>
              <input
                id="cp-to"
                type="email"
                className="input"
                required
                maxLength={200}
                autoFocus
                autoComplete="off"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cp-name">Recipient name (optional)</label>
              <input
                id="cp-name"
                className="input"
                maxLength={200}
                autoComplete="off"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
              />
            </div>
            <div className="field field--wide">
              <label htmlFor="cp-subject">Subject</label>
              <input
                id="cp-subject"
                className="input"
                required
                maxLength={300}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="field field--wide">
              <label htmlFor="cp-body">Message</label>
              <textarea
                id="cp-body"
                className="input"
                required
                rows={12}
                maxLength={status.limits.bodyChars}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="field field--wide">
              <label htmlFor="cp-sig">Signature</label>
              <select
                id="cp-sig"
                className="input"
                value={sigId}
                onChange={(e) => setSigId(e.target.value)}
              >
                <option value="">No signature</option>
                {saved.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))}
              </select>
              {!saved.length && (
                <p className="hint">
                  No saved signatures yet. <Link href="/templates">Create one</Link>.
                </p>
              )}
            </div>
          </div>
          <p className="hint">
            A tracking pixel is added automatically. Limits: {status.limits.perHour} emails an hour,{' '}
            {status.limits.perDay} a day. The recipient, subject and message are sent through Gmail;
            we keep the subject, recipient and open history, not the message body.
          </p>
          {preview !== undefined && (
            <div className="compose__preview">
              <p className="hint">
                Preview, from {status.email} to {to || '…'} · Subject: {subject || '…'}
              </p>
              <iframe
                title="Email preview"
                sandbox=""
                srcDoc={`<body style="margin:16px;background:#fff">${preview}</body>`}
                className="compose__frame"
              />
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <div className="tracker__actions">
            <button type="button" className="btn" onClick={showPreview} disabled={!body.trim()}>
              {preview === undefined ? 'Preview' : 'Refresh preview'}
            </button>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? 'Sending…' : 'Send'}
            </button>
            <Link href="/track" className="btn btn--text">
              Cancel
            </Link>
          </div>
        </form>
      )}

      <TrackerNotice />
    </div>
  )
}

export function Compose() {
  return (
    <Suspense>
      <ComposeInner />
    </Suspense>
  )
}
