'use client'

import Link from 'next/link'

import { useSession } from '@/lib/client/api'

export function AuthNav() {
  const user = useSession()
  if (user === undefined) return <span className="nav__placeholder" />
  return user ? (
    <Link href="/account" className="btn btn--ghost">
      My signatures
    </Link>
  ) : (
    <>
      <Link href="/login" className="nav__link">
        Log in
      </Link>
      <Link href="/signup" className="btn btn--ghost">
        Sign up
      </Link>
    </>
  )
}
