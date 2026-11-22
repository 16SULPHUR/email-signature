'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { authClient } from '@/lib/auth/client'

const ALLOWED = ['/account', '/admin']

export function AuthComplete() {
  const next = useSearchParams().get('next') || '/account'
  const [error, setError] = useState('')

  useEffect(() => {
    authClient
      .getSession()
      .then(({ data, error }) => {
        if (error || !data?.user) throw new Error(error?.message || 'Sign in did not complete')
        window.location.replace(ALLOWED.includes(next) ? next : '/account')
      })
      .catch((err: Error) => setError(err.message))
  }, [next])

  return (
    <div className="auth panel">
      <h1>{error ? 'Sign in failed' : 'Signing you in…'}</h1>
      {error && (
        <>
          <p className="error">{error}</p>
          <p className="hint">
            <a href="/login">Back to log in</a>
          </p>
        </>
      )}
    </div>
  )
}
