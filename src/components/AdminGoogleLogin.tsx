'use client'

import { useState } from 'react'

import { authClient } from '@/lib/auth/client'

export function AdminGoogleLogin() {
  const [error, setError] = useState('')
  const go = async () => {
    setError('')
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: `${window.location.origin}/admin`,
    })
    if (error) setError(error.message || 'Could not start sign in')
  }
  return (
    <div style={{ marginBottom: 24 }}>
      <button type="button" className="btn btn--style-secondary btn--size-large" style={{ width: '100%' }} onClick={go}>
        <span className="btn__content">Continue with Google</span>
      </button>
      {error && <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>}
      <p style={{ textAlign: 'center', margin: '16px 0 0' }}>or use email and password</p>
    </div>
  )
}
