'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { api, type TrackedDetail, useSession } from '@/lib/client/api'
import { copyRich } from '@/lib/client/copy'
import { ago, fullDate, pixelHtml } from '@/lib/client/tracking'

const KIND = {
  open: { label: 'Direct', hint: 'Opened in the recipient’s mail app' },
  proxy: { label: 'Gmail proxy', hint: 'Loaded through Gmail’s image proxy, so location is hidden' },
  bot: { label: 'Scanner', hint: 'Automated link scanner, not counted as an open' },
} as const

export function TrackedDetailView({ id }: { id: string }) {
  const router = useRouter()
  const user = useSession()
  const [detail, setDetail] = useState<TrackedDetail>()
  const [missing, setMissing] = useState(false)
  const [showScanners, setShowScanners] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    const load = () =>
      api
        .getTracked(id)
        .then(setDetail)
        .catch(() => setMissing(true))
    load()
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [user, id, router])

  if (!user) return null

  if (missing && !detail)
    return (
      <div className="tracker">
        <Link href="/track" className="tracker__back">
          ← All tracked emails
        </Link>
        <p className="empty">This tracked email was not found.</p>
      </div>
    )
  if (!detail) return <div className="tracker"><p className="empty">Loading…</p></div>

  const opens = showScanners ? detail.opens : detail.opens.filter((o) => o.kind !== 'bot')
  const scannerCount = detail.opens.length - detail.opens.filter((o) => o.kind !== 'bot').length
  const to = [detail.recipient_name, detail.recipient_email && `<${detail.recipient_email}>`].filter(Boolean).join(' ')

  const remove = async () => {
    if (!window.confirm('Delete this tracked email and its open history?')) return
    await api.deleteTracked(id)
    router.push('/track')
  }

  return (
    <div className="tracker">
      <Link href="/track" className="tracker__back">
        ← All tracked emails
      </Link>

      <div className="account__head">
        <div>
          <h1>{detail.subject}</h1>
          <p className="hint">
            {to ? `To ${to}` : 'No recipient set'} · created {ago(detail.created_at)}
          </p>
        </div>
        <div className="tracker__actions">
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await copyRich(pixelHtml(id))
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? 'Copied' : 'Copy pixel'}
          </button>
          <button type="button" className="btn btn--text" onClick={remove}>
            Delete
          </button>
        </div>
      </div>

      <div className="tracker__stats">
        <div className="stat">
          <span className="stat__value">{detail.open_count}</span>
          <span className="stat__label">Opens</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--sm">{detail.first_opened_at ? fullDate(detail.first_opened_at) : '—'}</span>
          <span className="stat__label">First opened</span>
        </div>
        <div className="stat">
          <span className="stat__value stat__value--sm">{detail.last_opened_at ? fullDate(detail.last_opened_at) : '—'}</span>
          <span className="stat__label">Last opened</span>
        </div>
      </div>

      <div className="tracker__toolbar">
        <h2 className="tracker__heading">Opens</h2>
        {scannerCount > 0 && (
          <label className="tracker__toggle">
            <input type="checkbox" checked={showScanners} onChange={(e) => setShowScanners(e.target.checked)} />
            Show {scannerCount} scanner hit{scannerCount > 1 ? 's' : ''}
          </label>
        )}
      </div>

      {opens.length === 0 ? (
        <p className="empty">No opens recorded yet. This page refreshes on its own.</p>
      ) : (
        <div className="table-wrap">
          <table className="table tracker__opens">
            <thead>
              <tr>
                <th>When</th>
                <th>Device</th>
                <th>Location</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {opens.map((o, i) => (
                <tr key={i} className={o.kind === 'bot' ? 'table__dim' : undefined}>
                  <td>
                    <span className="table__main-text">{fullDate(o.opened_at)}</span>
                    <span className="table__sub">{ago(o.opened_at)}</span>
                  </td>
                  <td>{o.device || <span className="table__none">Unknown</span>}</td>
                  <td>{[o.city, o.country].filter(Boolean).join(', ') || <span className="table__none">Hidden</span>}</td>
                  <td>
                    <span className={`badge${o.kind === 'open' ? ' badge--on' : ''}`} title={KIND[o.kind].hint}>
                      {KIND[o.kind].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
