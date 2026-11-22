import type { CollectionConfig } from 'payload'

import { resetPasswordEmail, welcomeEmail } from '../lib/server/email'
import { adminOrSelf, isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Sigrio password',
      generateEmailHTML: (args) => resetPasswordEmail(args?.token || ''),
    },
  },
  access: {
    admin: isAdmin,
    create: () => true,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOrSelf,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      required: true,
      options: ['user', 'admin'],
      saveToJWT: true,
      access: {
        create: isAdmin,
        update: isAdmin,
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || !process.env.RESEND_API_KEY) return
        req.payload
          .sendEmail({ to: doc.email, subject: 'Welcome to Sigrio', html: welcomeEmail(doc.name) })
          .catch((err: unknown) => req.payload.logger.error({ err }, 'welcome email failed'))
      },
    ],
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const adminEmails = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map((e) => e.trim())
        const isListed = Boolean(data.email) && adminEmails.includes(String(data.email).toLowerCase())
        return { ...data, role: isListed ? 'admin' : req.user?.role === 'admin' ? data.role || 'user' : 'user' }
      },
    ],
  },
}
