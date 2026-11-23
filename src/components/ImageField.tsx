'use client'

import { useRef, useState } from 'react'

import { api } from '@/lib/client/api'

type Kind = Parameters<typeof api.uploadImage>[1]

export function ImageField({
  kind,
  value,
  onChange,
  onError,
  label,
}: {
  kind: Kind
  value: string
  onChange: (url: string) => void
  onError: (msg: string) => void
  label: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await api.uploadImage(file, kind))
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <span className="imgfield">
      {value && <img className="imgfield__thumb" src={value} alt="" />}
      <button type="button" className="btn btn--sm" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Uploading…' : value ? 'Replace' : `Upload ${label}`}
      </button>
      {value && !busy && (
        <button type="button" className="btn btn--text btn--sm" onClick={() => onChange('')}>
          Remove
        </button>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </span>
  )
}
