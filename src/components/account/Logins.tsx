'use client'

import { useCallback, useEffect, useState } from 'react'

import { PageHead } from '@/components/account/AccountShell'
import { authClient } from '@/lib/auth/client'

type LinkedAccount = { id: string; providerId: string; accountId: string; createdAt?: string }

const PROVIDERS = (process.env.NEXT_PUBLIC_SOCIAL_PROVIDERS || 'google')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean)

const LABELS: Record<string, string> = {
  credential: 'Email and password',
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
  discord: 'Discord',
  apple: 'Apple',
}

type Client = {
  listAccounts: () => Promise<{ data: LinkedAccount[] | null; error: { message?: string } | null }>
  linkSocial: (a: { provider: string; callbackURL: string }) => Promise<{ error: { message?: string } | null }>
  unlinkAccount: (a: { providerId: string; accountId?: string }) => Promise<{ error: { message?: string } | null }>
}
const client = authClient as unknown as Client

export function Logins() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>()
  const [error, setError] = useState('')

  const load = useCallback(
    () =>
      client
        .listAccounts()
        .catch(() => ({ data: null, error: { message: 'unavailable' } }))
        .then(({ data, error }) => {
          if (error) setError('Could not load linked logins right now.')
          setAccounts(data || [])
        }),
    [],
  )

  useEffect(() => {
    load()
  }, [load])

  const link = async (provider: string) => {
    setError('')
    const { error } = await client.linkSocial({
      provider,
      callbackURL: `${window.location.origin}/account/logins`,
    })
    if (error) setError(error.message || 'Could not link this login')
  }

  const unlink = async (a: LinkedAccount) => {
    if (!window.confirm(`Disconnect ${LABELS[a.providerId] || a.providerId}?`)) return
    setError('')
    const { error } = await client.unlinkAccount({ providerId: a.providerId, accountId: a.accountId })
    if (error) setError(error.message || 'Could not disconnect')
    load()
  }

  const linked = new Set(accounts?.map((a) => a.providerId))

  return (
    <>
      <PageHead title="Logins" hint="Ways you can sign in to this account." />
      {error && <p className="error">{error}</p>}
      <section className="panel acct__stack">
        <h2>Connected</h2>
        {accounts?.length === 0 && <p className="hint">No linked logins found. You sign in with a password set on the profile page.</p>}
        {accounts?.map((a) => (
          <div key={a.id} className="acct__row acct__row--between">
            <span>{LABELS[a.providerId] || a.providerId}</span>
            {accounts.length > 1 && (
              <button type="button" className="btn btn--text btn--sm" onClick={() => unlink(a)}>
                Disconnect
              </button>
            )}
          </div>
        ))}
      </section>
      {PROVIDERS.some((p) => !linked.has(p)) && (
        <section className="panel acct__stack">
          <h2>Add a login</h2>
          <div className="acct__row">
            {PROVIDERS.filter((p) => !linked.has(p)).map((p) => (
              <button key={p} type="button" className="btn" onClick={() => link(p)}>
                Connect {LABELS[p] || p}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
