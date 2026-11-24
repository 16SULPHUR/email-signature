'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { PageHead, useAccountUser } from '@/components/account/AccountShell'
import { authClient } from '@/lib/auth/client'
import { accountApi, formatBytes, useSummary } from '@/lib/client/account'

export function DataPrivacy() {
  const user = useAccountUser()
  const router = useRouter()
  const [data, reload] = useSummary()
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const s = data?.summary

  const rows = [
    ['signatures', 'Saved signatures', s && `${s.signatures} saved`, 'Names, templates and every detail in them'],
    ['uploads', 'Uploaded images', s && `${s.uploads} files · ${formatBytes(s.upload_bytes)}`, 'Photos, logos and banners'],
    ['tracking', 'Tracked emails', s && `${s.tracked} emails · ${s.opens} opens`, 'Subjects, recipients and open events'],
    ['entries', 'Editor entries', s && `${s.entries} stored`, 'The details you typed into the editor, kept to improve the product'],
  ] as const

  const clear = async (category: string, label: string) => {
    if (!window.confirm(`Delete all of your ${label.toLowerCase()}? This cannot be undone.`)) return
    await accountApi.deleteCategory(category)
    reload()
  }

  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await accountApi.deleteAccount(confirm)
      await (authClient as unknown as { deleteUser: () => Promise<unknown> }).deleteUser().catch(() => {})
      await fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
      await authClient.signOut().catch(() => {})
      router.push('/')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <>
      <PageHead title="Data & privacy" hint="Everything we store about this account. See the privacy policy for why." />
      <section className="panel acct__stack">
        <h2>Your data</h2>
        {rows.map(([key, label, count, desc]) => (
          <div key={key} className="acct__row acct__row--between">
            <div>
              <strong>{label}</strong> <span className="hint">{count ?? '…'}</span>
              <p className="hint acct__desc">{desc}</p>
            </div>
            <button type="button" className="btn btn--text btn--sm" onClick={() => clear(key, label)}>
              Delete all
            </button>
          </div>
        ))}
        <p className="hint">Account details: {user.email}{user.name ? `, ${user.name}` : ''}. Removed when you delete the account.</p>
      </section>

      <section className="panel acct__stack">
        <h2>Export</h2>
        <p className="hint">Download everything above as a JSON file.</p>
        <div>
          <a className="btn" href="/api/account/export" download>
            Download my data
          </a>
        </div>
      </section>

      <form className="panel acct__stack acct__danger" onSubmit={deleteAccount}>
        <h2>Delete account</h2>
        <p className="hint">
          Permanently removes your account and all of the data listed above. Type <strong>{user.email}</strong> to confirm.
        </p>
        <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={user.email} aria-label="Confirm email" />
        {error && <p className="error">{error}</p>}
        <div>
          <button className="btn btn--danger" disabled={confirm.trim().toLowerCase() !== user.email.toLowerCase()}>
            Delete my account
          </button>
        </div>
      </form>
    </>
  )
}
