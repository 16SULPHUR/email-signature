'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createContext, useContext, useEffect } from 'react'

import { api, type SessionUser, useSession } from '@/lib/client/api'

const UserContext = createContext<SessionUser | null>(null)
export const useAccountUser = () => useContext(UserContext) as SessionUser

const LINKS = [
  ['/account', 'overview'],
  ['/account/signatures', 'signatures'],
  ['/account/uploads', 'uploads'],
  ['/account/tracking', 'tracking'],
  ['/account/profile', 'profile'],
  ['/account/logins', 'logins'],
  ['/account/data', 'data & privacy'],
] as const

export function AccountShell({ children }: { children: React.ReactNode }) {
  const user = useSession()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => {
    if (user === null) router.replace('/login')
  }, [user, router])

  if (!user) return null

  return (
    <UserContext.Provider value={user}>
      <div className="acct">
        <aside className="acct__side">
          <div className="acct__who">
            <strong>{user.name || 'Your account'}</strong>
            <span className="hint">{user.email}</span>
          </div>
          <nav className="acct__nav">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={path === href ? 'is-active' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="btn btn--sm"
            onClick={async () => {
              await api.logout()
              router.push('/')
              router.refresh()
            }}
          >
            Log out
          </button>
        </aside>
        <div className="acct__body">{children}</div>
      </div>
    </UserContext.Provider>
  )
}

export function PageHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="acct__head">
      <h1>{title}</h1>
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}
