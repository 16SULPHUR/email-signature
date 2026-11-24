'use client'

import Link from 'next/link'

import { useSession } from '@/lib/client/api'

export function AuthNav() {
  const user = useSession()
  if (user === undefined) return <span className="nav__placeholder" />
  return user ? (
    <>
      <Link href="/track" className="nav__link">
        tracking
      </Link>
      <Link href="/account" className="btn btn--ghost">
        my signatures
      </Link>
    </>
  ) : (
    <>
      <Link href="/login" className="nav__link">
        log in
      </Link>
      <Link href="/signup" className="btn btn--ghost">
        sign up
      </Link>
    </>
  )
}
