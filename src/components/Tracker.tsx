'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { api, type SavedSignature, type TrackedEmail, useSession } from '@/lib/client/api'
import { copyRich } from '@/lib/client/copy'
import { ago, pixelHtml, recipientLabel } from '@/lib/client/tracking'
import type { Template } from '@/lib/signature/types'

import { NewTrackedModal } from './NewTrackedModal'

type Filter = 'all' | 'opened' | 'unopened'

export function Tracker({ templates }: { templates: Template[] }) {
  const router = useRouter()
  const user = useSession()
  const [items, setItems] = useState<TrackedEmail[]>()
  const [saved, setSaved] = useState<SavedSignature[]>([])
  const [modal, setModal] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [toast, setToast] = useState('')

  const load = useCallback(() => api.listTracked().then((r) => setItems(r.docs)).catch(() => {}), [])

  useEffect(() => {
    if (user === null) router.replace('/login')
    if (!user) return
    load()
    api.listSignatures().then((r) => setSaved(r.docs)).catch(() => {})
    const timer = setInterval(load, 30000)
    return () => clearInterval(timer)
  }, [user, router, load])

  const stats = useMemo(() => {
    const list = items ?? []
    const opened = list.filter((t) => t.open_count > 0).length
    return {
      total: list.length,
      opened,
      rate: list.length ? Math.round((opened / list.length) * 100) : 0,
      opens: list.reduce((n, t) => n + t.open_count, 0),
    }
  }, [items])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (items ?? []).filter((t) => {
      if (filter === 'opened' && !t.open_count) return false
      if (filter === 'unopened' && t.open_count) return false
      if (!q) return true
      return [t.subject, t.recipient_name, t.recipient_email].some((v) => v?.toLowerCase().includes(q))
    })
  }, [items, query, filter])

  if (!user) return null

  const flash = (text: string) => {
    setToast(text)
    setTimeout(() => setToast(''), 2500)
  }

  const remove = async (t: TrackedEmail) => {
    if (!window.confirm(`Delete "${t.subject}" and its open history?`)) return
    await api.deleteTracked(t.id)
    setItems((list) => list?.filter((x) => x.id !== t.id))
  }

  const filters: [Filter, string][] = [
    ['all', 'All'],
    ['opened', 'Opened'],
    ['unopened', 'Not opened'],
  ]

  return (
    <div className="tracker">
      <div className="account__head">
        <div>
          <h1>Tracked emails</h1>
          <p className="hint">See which emails were opened, by whom, and when.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModal(true)}>
          + New tracked email
        </button>
      </div>

      <div className="tracker__stats">
        <div className="stat">
          <span className="stat__value">{stats.total}</span>
          <span className="stat__label">Tracked</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.opened}</span>
          <span className="stat__label">Opened</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.rate}%</span>
          <span className="stat__label">Open rate</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.opens}</span>
          <span className="stat__label">Total opens</span>
        </div>
      </div>

      <div className="tracker__toolbar">
        <input
          className="input tracker__search"
          type="search"
          placeholder="Search subject or recipient"
          aria-label="Search tracked emails"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="tracker__filters" role="group" aria-label="Filter by status">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip${filter === key ? ' chip--on' : ''}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {items === undefined ? (
        <p className="empty">Loading…</p>
      ) : items.length === 0 ? (
        <div className="empty tracker__empty">
          <p>No tracked emails yet.</p>
          <button type="button" className="btn btn--primary" onClick={() => setModal(true)}>
            Track your first email
          </button>
        </div>
      ) : visible.length === 0 ? (
        <p className="empty">Nothing matches your search.</p>
      ) : (
        <div className="table-wrap">
          <table className="table tracker__table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Recipient</th>
                <th>Status</th>
                <th className="num">Opens</th>
                <th>Created</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className="table__main">
                    <Link href={`/track/${t.id}`} title={t.subject}>
                      {t.subject}
                    </Link>
                  </td>
                  <td title={t.recipient_email ?? undefined}>
                    <span className={t.recipient_name || t.recipient_email ? undefined : 'table__none'}>
                      {recipientLabel(t.recipient_name, t.recipient_email)}
                    </span>
                  </td>
                  <td>
                    {t.open_count ? (
                      <span className="badge badge--on">Opened {ago(t.last_opened_at!)}</span>
                    ) : (
                      <span className="badge">Not opened</span>
                    )}
                  </td>
                  <td className="num">{t.open_count}</td>
                  <td className="table__none">{ago(t.created_at)}</td>
                  <td className="table__actions">
                    <button
                      type="button"
                      className="btn btn--text btn--sm"
                      onClick={async () => {
                        await copyRich(pixelHtml(t.id))
                        flash('Tracking pixel copied')
                      }}
                    >
                      Copy pixel
                    </button>
                    <Link className="btn btn--text btn--sm" href={`/track/${t.id}`}>
                      Opens →
                    </Link>
                    <button type="button" className="btn btn--text btn--sm" onClick={() => remove(t)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="hint hint--warn">
        Opens are approximate. Apple Mail and some other apps load images automatically, which can show an open that
        nobody made, and recipients who block images are never counted. An open does not prove the email was read.
        Tell your recipients you use tracking where the law requires it. See the{' '}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <NewTrackedModal open={modal} onClose={() => setModal(false)} onCreated={load} templates={templates} saved={saved} />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
