'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { api } from '@/lib/client/api'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'signup') await api.signup(name, email, password)
      await api.login(email, password)
      router.push('/account')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth panel" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Welcome back' : 'Create a free account'}</h1>
      <p className="hint">
        {mode === 'login'
          ? 'Log in to open your saved signatures.'
          : 'Optional. Save signatures and open them on any device.'}
      </p>
      {mode === 'signup' && (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn btn--primary" disabled={busy}>
        {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
      <p className="hint">
        {mode === 'login' ? (
          <>
            New here? <Link href="/signup">Create an account</Link>
          </>
        ) : (
          <>
            Already have one? <Link href="/login">Log in</Link>
          </>
        )}
      </p>
    </form>
  )
}
