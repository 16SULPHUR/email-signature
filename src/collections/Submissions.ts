import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'template', 'copied', 'updatedAt'],
    group: 'Analytics',
  },
  access: {
    create: () => false,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'visitorId', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text' },
    { name: 'email', type: 'text', index: true },
    { name: 'template', type: 'text', index: true },
    { name: 'copied', type: 'checkbox', defaultValue: false },
    { name: 'data', type: 'json' },
    { name: 'user', type: 'relationship', relationTo: 'users' },
  ],
}
