'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { TrackerNotice } from '@/components/TrackerNotice'
import { api, type TrackedDetail, useSession } from '@/lib/client/api'
import { copyRich } from '@/lib/client/copy'
import { ago, pixelHtml } from '@/lib/client/tracking'

export function TrackerDetail({ id }: { id: string }) {
  const router = useRouter()
  const user = useSession()
  const [detail, setDetail] = useState<TrackedDetail>()
  const [missing, setMissing] = useState(false)
  const [flash, setFlash] = useState('')

  const load = useCallback(
    () => api.getTracked(id).then(setDetail).catch(() => setDetail((d) => d || (setMissing(true) as never))),
    [id],
  )

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [user, router, load])

  if (!user) return null
  if (missing)
    return (
      <div className="tracker tracker--narrow">
        <p className="empty">
          This tracked email was not found. <Link href="/track">Back to tracked emails</Link>
        </p>
      </div>
    )
  if (!detail) return <div className="tracker" />

  const counted = detail.opens.filter((o) => o.kind !== 'bot')
  const to = [detail.recipient_name, detail.recipient_email && `<${detail.recipient_email}>`].filter(Boolean).join(' ')

  return (
    <div className="tracker">
      <div className="account__head">
        <div>
          <h1>{detail.subject}</h1>
          <p className="hint">
            <Link href="/track">Tracked emails</Link> / {to || 'No recipient set'} · created {ago(detail.created_at)}
          </p>
        </div>
        <div className="tracker__actions">
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await copyRich(pixelHtml(detail.id))
              setFlash('Tracking pixel copied')
              setTimeout(() => setFlash(''), 2500)
            }}
          >
            Copy pixel
          </button>
          <button
            type="button"
            className="btn btn--text"
            onClick={async () => {
              if (!window.confirm('Delete this tracked email and its open history?')) return
              await api.deleteTracked(detail.id)
              router.push('/track')
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {flash && <p className="hint">{flash}</p>}

      <div className="tracker__stats">
        <div className="panel">
          <span className={`tracker__stat${detail.open_count ? ' tracker__stat--on' : ''}`}>
            {detail.open_count ? 'Opened' : 'Not opened'}
          </span>
          <span className="hint">Status</span>
        </div>
        <div className="panel">
          <span className="tracker__stat">{detail.open_count}</span>
          <span className="hint">Opens</span>
        </div>
        <div className="panel">
          <span className="tracker__stat">{detail.first_opened_at ? ago(detail.first_opened_at) : '·'}</span>
          <span className="hint">First opened</span>
        </div>
        <div className="panel">
          <span className="tracker__stat">{detail.last_opened_at ? ago(detail.last_opened_at) : '·'}</span>
          <span className="hint">Last opened</span>
        </div>
      </div>

      <h2 className="tracker__heading">Opens log</h2>
      {detail.opens.length === 0 ? (
        <p className="empty">No opens recorded yet. This page refreshes on its own.</p>
      ) : (
        <div className="tracker__tablewrap">
          <table className="tracker__table">
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
                  <td data-label="When">{new Date(o.opened_at).toLocaleString()}</td>
                  <td data-label="Device">{o.device || 'Unknown'}</td>
                  <td data-label="Where">{[o.city, o.country].filter(Boolean).join(', ') || 'Hidden'}</td>
                  <td data-label="Type">
                    {o.kind === 'bot' ? 'Scanner (not counted)' : o.kind === 'proxy' ? 'Via Gmail proxy' : 'Direct'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {counted.length < detail.opens.length && (
        <p className="hint">Greyed rows are automated link scanners and are not counted as opens.</p>
      )}
      <TrackerNotice />
    </div>
  )
}
