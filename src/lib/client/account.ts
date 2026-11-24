'use client'

import { useCallback, useEffect, useState } from 'react'

export type AccountSummary = {
  signatures: number
  uploads: number
  upload_bytes: number
  tracked: number
  opens: number
  entries: number
}

export type UploadItem = { id: string; mime: string; size: number; kind: string; created_at: string; url: string }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error || body?.errors?.[0]?.message || `Request failed (${res.status})`)
  return body as T
}

const send = (url: string, method: string, body?: object) =>
  fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => json<Record<string, unknown>>(r))

export const accountApi = {
  summary: () =>
    fetch('/api/account', { credentials: 'include' }).then((r) =>
      json<{ user: { email: string; name: string; createdAt: string }; summary: AccountSummary }>(r),
    ),
  uploads: () => fetch('/api/account/uploads', { credentials: 'include' }).then((r) => json<{ docs: UploadItem[] }>(r)),
  deleteUpload: (id: string) => send(`/api/account/uploads?id=${encodeURIComponent(id)}`, 'DELETE'),
  deleteCategory: (category: string) => send(`/api/account/data?category=${category}`, 'DELETE'),
  changePassword: (current: string, next: string) => send('/api/account/password', 'POST', { current, next }),
  updateName: (id: string | number, name: string) => send(`/api/users/${id}`, 'PATCH', { name }),
  deleteAccount: (confirm: string) => send('/api/account/delete', 'POST', { confirm }),
}

export function useSummary() {
  const [data, setData] = useState<Awaited<ReturnType<typeof accountApi.summary>>>()
  const load = useCallback(() => accountApi.summary().then(setData).catch(() => {}), [])
  useEffect(() => {
    load()
  }, [load])
  return [data, load] as const
}

export const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1048576).toFixed(1)} MB`)
