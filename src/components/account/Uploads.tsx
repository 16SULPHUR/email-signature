'use client'

import { useEffect, useState } from 'react'

import { PageHead } from '@/components/account/AccountShell'
import { accountApi, formatBytes, type UploadItem } from '@/lib/client/account'

export function Uploads() {
  const [items, setItems] = useState<UploadItem[]>()
  const [error, setError] = useState('')

  useEffect(() => {
    accountApi.uploads().then((r) => setItems(r.docs)).catch((e: Error) => setError(e.message))
  }, [])

  const remove = async (id: string) => {
    if (!window.confirm('Delete this image? Signatures using it will show a broken image.')) return
    await accountApi.deleteUpload(id)
    setItems((list) => list?.filter((i) => i.id !== id))
  }

  return (
    <>
      <PageHead title="Uploads" hint="Images you uploaded while signed in. They are public to anyone who receives your signature." />
      {error && <p className="error">{error}</p>}
      {items?.length === 0 && <p className="empty">No uploads yet.</p>}
      <div className="acct__uploads">
        {items?.map((i) => (
          <div key={i.id} className="acct__upload">
            <div className="acct__thumb">
              <img src={i.url} alt="" />
            </div>
            <div className="acct__upload-meta">
              <span>
                {i.kind} · {formatBytes(i.size)}
              </span>
              <span className="hint">{new Date(i.created_at).toLocaleDateString()}</span>
            </div>
            <button type="button" className="btn btn--text btn--sm" onClick={() => remove(i.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
