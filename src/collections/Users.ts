import type { CollectionConfig } from 'payload'

import { adminOrSelf, isAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
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
