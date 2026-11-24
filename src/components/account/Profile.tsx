'use client'

import { useState } from 'react'

import { PageHead, useAccountUser } from '@/components/account/AccountShell'
import { accountApi } from '@/lib/client/account'

export function Profile() {
  const user = useAccountUser()
  const [name, setName] = useState(user.name || '')
  const [nameMsg, setNameMsg] = useState('')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameMsg('')
    try {
      await accountApi.updateName(user.id, name.trim())
      setNameMsg('Saved')
    } catch (err) {
      setNameMsg((err as Error).message)
    }
  }

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg('')
    setPwError('')
    try {
      await accountApi.changePassword(current, next)
      setCurrent('')
      setNext('')
      setPwMsg('Password changed')
    } catch (err) {
      setPwError((err as Error).message)
    }
  }

  return (
    <>
      <PageHead title="Profile" />
      <form className="panel acct__stack" onSubmit={saveName}>
        <h2>Details</h2>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" value={user.email} disabled />
        </div>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="acct__row">
          <button className="btn btn--primary">Save</button>
          {nameMsg && <span className="hint">{nameMsg}</span>}
        </div>
      </form>

      <form className="panel acct__stack" onSubmit={savePassword}>
        <h2>Password</h2>
        <div className="field">
          <label htmlFor="current">Current password</label>
          <input id="current" type="password" required className="input" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="field">
          <label htmlFor="next">New password</label>
          <input id="next" type="password" required minLength={8} className="input" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        </div>
        {pwError && <p className="error">{pwError}</p>}
        <div className="acct__row">
          <button className="btn btn--primary">Change password</button>
          {pwMsg && <span className="hint">{pwMsg}</span>}
        </div>
        <p className="hint">
          Signed up with a social login and never set a password? <a href="/forgot-password">Set one by email</a>.
        </p>
      </form>
    </>
  )
}
