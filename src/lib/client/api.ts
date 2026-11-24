'use client'

import { useEffect, useState } from 'react'

export type SessionUser = { id: number | string; email: string; name?: string; role?: string }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body?.errors?.[0]?.message || body?.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return body as T
}

export const api = {
  me: () =>
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => json<{ user: SessionUser | null }>(r))
      .then((b) => b.user),
  login: (email: string, password: string) =>
    fetch('/api/users/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then((r) => json<{ user: SessionUser }>(r)),
  signup: (name: string, email: string, password: string) =>
    fetch('/api/users', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then((r) => json(r)),
  logout: async () => {
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {})
  },
  listSignatures: () =>
    fetch('/api/signatures?limit=100&sort=-updatedAt&depth=0', { credentials: 'include' }).then((r) =>
      json<{ docs: SavedSignature[] }>(r),
    ),
  getSignature: (id: string) =>
    fetch(`/api/signatures/${id}?depth=0`, { credentials: 'include' }).then((r) => json<SavedSignature>(r)),
  saveSignature: (body: Omit<SavedSignature, 'id' | 'updatedAt'>, id?: string | number) =>
    fetch(id ? `/api/signatures/${id}` : '/api/signatures', {
      method: id ? 'PATCH' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<{ doc: SavedSignature }>(r)),
  deleteSignature: (id: string | number) =>
    fetch(`/api/signatures/${id}`, { method: 'DELETE', credentials: 'include' }).then((r) => json(r)),
  uploadImage: async (file: File, kind: 'photo' | 'logo' | 'banner' | 'handwriting') => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    const res = await fetch('/upload', { method: 'POST', credentials: 'include', body: form })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Upload failed')
    return body.url as string
  },
  createShare: (template: string, data: import('@/lib/signature/types').SignatureData) =>
    fetch('/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, data }),
    }).then((r) => json<{ id: string }>(r)),
  getShare: (id: string) =>
    fetch(`/share/${id}`).then((r) => json<{ template: string; data: import('@/lib/signature/types').SignatureData }>(r)),
  collect: (template: string, data: import('@/lib/signature/types').SignatureData, copied = false) =>
    fetch('/collect', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId(), template, data, copied }),
      keepalive: true,
    }).catch(() => {}),
  listTracked: () => fetch('/tracked', { credentials: 'include' }).then((r) => json<{ docs: TrackedEmail[] }>(r)),
  getTracked: (id: string) =>
    fetch(`/tracked/${id}`, { credentials: 'include' }).then((r) => json<TrackedDetail>(r)),
  createTracked: (body: { subject: string; recipientName: string; recipientEmail: string }) =>
    fetch('/tracked', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => json<{ id: string }>(r)),
  mailStatus: () =>
    fetch('/api/mail/status', { credentials: 'include' }).then((r) =>
      json<{ available: boolean; email: string | null; limits: { perHour: number; perDay: number; bodyChars: number } }>(r),
    ),
  mailPreview: (body: string, signatureId: string) =>
    fetch('/api/mail/preview', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, signatureId }),
    }).then((r) => json<{ html: string }>(r)),
  mailDisconnect: () => fetch('/api/mail/disconnect', { method: 'POST', credentials: 'include' }).then((r) => json(r)),
  mailSend: async (body: { to: string; toName: string; subject: string; body: string; signatureId: string }) => {
    const res = await fetch('/api/mail/send', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const out = await res.json().catch(() => ({}))
    if (!res.ok) throw Object.assign(new Error(out.error || 'Could not send'), { reconnect: Boolean(out.reconnect) })
    return out as { id: string }
  },
  deleteTracked: (id: string) =>
    fetch(`/tracked/${id}`, { method: 'DELETE', credentials: 'include' }).then((r) => json(r)),
  trackCopy: (template: string, kind: 'rich' | 'html' | 'download') =>
    fetch('/api/copy-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template, kind }),
      keepalive: true,
    }).catch(() => {}),
}

function visitorId() {
  const key = 'sig:visitor'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export type SavedSignature = {
  id: number | string
  name: string
  template: string
  data: import('@/lib/signature/types').SignatureData
  updatedAt: string
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined)
  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null))
  }, [])
  return user
}

export type TrackedEmail = {
  id: string
  subject: string
  recipient_name: string | null
  recipient_email: string | null
  open_count: number
  first_opened_at: string | null
  last_opened_at: string | null
  created_at: string
}

export type TrackedDetail = TrackedEmail & {
  opens: { opened_at: string; kind: 'open' | 'proxy' | 'bot'; device: string | null; country: string | null; city: string | null }[]
}
