import crypto from 'node:crypto'
import type { AuthStrategy } from 'payload'

import { neonAuth } from './server'

const adminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

export const neonAuthStrategy: AuthStrategy = {
  name: 'neon-auth',
  authenticate: async ({ headers, payload }) => {
    if (!neonAuth || !headers.get('cookie')?.includes('neon-auth')) return { user: null }
    const { data } = await neonAuth.getSession().catch(() => ({ data: null }))
    const email = data?.user?.email?.toLowerCase()
    if (!email) return { user: null }

    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    let user = found.docs[0]
    if (!user) {
      user = await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: {
          email,
          name: data?.user?.name || undefined,
          password: crypto.randomBytes(24).toString('base64url'),
          role: adminEmails().includes(email) ? 'admin' : 'user',
        },
      })
    }
    return { user: { ...user, collection: 'users', _strategy: 'neon-auth' } }
  },
}
