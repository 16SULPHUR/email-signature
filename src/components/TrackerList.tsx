'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TrackerNotice } from '@/components/TrackerNotice'
import { api, type TrackedEmail, useSession } from '@/lib/client/api'
import { copyRich } from '@/lib/client/copy'
import { ago, pixelHtml, recipientOf } from '@/lib/client/tracking'

type Filter = 'all' | 'opened' | 'waiting'

export function TrackerList() {
  const router = useRouter()
  const user = useSession()
  const [items, setItems] = useState<TrackedEmail[]>()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [flash, setFlash] = useState('')

  const load = useCallback(() => api.listTracked().then((r) => setItems(r.docs)).catch(() => {}), [])

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    load()
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [user, router, load])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (items || []).filter(
      (t) =>
        (filter === 'all' || (filter === 'opened' ? t.open_count > 0 : t.open_count === 0)) &&
        (!q || `${t.subject} ${t.recipient_name} ${t.recipient_email}`.toLowerCase().includes(q)),
    )
  }, [items, filter, query])

  if (!user) return null

  const opened = items?.filter((t) => t.open_count > 0).length ?? 0
  const total = items?.length ?? 0

  const copy = async (id: string) => {
    await copyRich(pixelHtml(id))
    setFlash('Tracking pixel copied')
    setTimeout(() => setFlash(''), 2500)
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
          <p className="hint">See which emails were opened and when.</p>
        </div>
        <Link href="/track/new" className="btn btn--primary">
          New tracked email
        </Link>
      </div>

      <div className="tracker__stats">
        <div className="panel">
          <span className="tracker__stat">{total}</span>
          <span className="hint">Tracked</span>
        </div>
        <div className="panel">
          <span className="tracker__stat">{opened}</span>
          <span className="hint">Opened</span>
        </div>
        <div className="panel">
          <span className="tracker__stat">{total - opened}</span>
          <span className="hint">Not opened</span>
        </div>
      </div>

      <TrackerNotice />

      {items && total > 0 && (
        <div className="tracker__toolbar">
          <div className="chips chips--sm">
            {(['all', 'opened', 'waiting'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`chip${filter === f ? ' chip--on' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'opened' ? 'Opened' : 'Not opened'}
              </button>
            ))}
          </div>
          <input
            className="input tracker__search"
            type="search"
            placeholder="Search subject or recipient"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      {flash && <p className="hint">{flash}</p>}

      {items && total === 0 && (
        <div className="panel tracker__empty">
          <h2>No tracked emails yet</h2>
          <p className="hint">Create one, paste its pixel into an email, and its opens will show up here.</p>
          <Link href="/track/new" className="btn btn--primary">
            Track your first email
          </Link>
        </div>
      )}

      {total > 0 && (
        <div className="tracker__tablewrap">
          <table className="tracker__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Last opened</th>
                <th>Sent</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id}>
                  <td data-label="Email">
                    <Link href={`/track/${t.id}`} className="tracker__subject">
                      {t.subject}
                    </Link>
                  </td>
                  <td data-label="Recipient">{recipientOf(t) || <span className="hint">None</span>}</td>
                  <td data-label="Status">
                    <span className={`tracker__status${t.open_count ? ' tracker__status--on' : ''}`}>
                      {t.open_count ? `Opened ×${t.open_count}` : 'Not opened'}
                    </span>
                  </td>
                  <td data-label="Last opened">{t.last_opened_at ? ago(t.last_opened_at) : '·'}</td>
                  <td data-label="Sent">{ago(t.created_at)}</td>
                  <td className="tracker__actions">
                    <Link href={`/track/${t.id}`} className="btn btn--sm">
                      Details
                    </Link>
                    <button type="button" className="btn btn--sm" onClick={() => copy(t.id)}>
                      Copy pixel
                    </button>
                    <button type="button" className="btn btn--text btn--sm" onClick={() => remove(t.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty">Nothing matches.</p>}
        </div>
      )}
    </div>
  )
}
