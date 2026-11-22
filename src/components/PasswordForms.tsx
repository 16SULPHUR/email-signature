'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const post = async (url: string, body: object) => {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.errors?.[0]?.message || 'Something went wrong')
  }
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await post('/api/users/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="auth panel" onSubmit={submit}>
      <h1>Forgot password</h1>
      {sent ? (
        <p className="hint">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <>
          <p className="hint">Enter your email and we&apos;ll send you a reset link.</p>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn--primary">Send reset link</button>
        </>
      )}
      <p className="hint">
        <Link href="/login">Back to log in</Link>
      </p>
    </form>
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const token = useSearchParams().get('token') || ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await post('/api/users/reset-password', { token, password })
      router.push('/account')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <form className="auth panel" onSubmit={submit}>
      <h1>Choose a new password</h1>
      <div className="field">
        <label htmlFor="password">New password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {!token && <p className="error">This link is missing its token. Request a new one.</p>}
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" disabled={!token}>
        Save password
      </button>
    </form>
  )
}
