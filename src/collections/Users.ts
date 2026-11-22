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
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        return { ...data, role: totalDocs === 0 ? 'admin' : data.role || 'user' }
      },
    ],
  },
}
