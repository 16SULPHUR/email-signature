import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const Templates: CollectionConfig = {
  slug: 'templates',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'category', 'animated', 'published', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: ({ req }) => (req.user?.role === 'admin' ? true : { published: { equals: true } }),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'category', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'tags', type: 'json', defaultValue: [] },
    { name: 'width', type: 'number', required: true, defaultValue: 520 },
    { name: 'animated', type: 'checkbox', defaultValue: false },
    { name: 'published', type: 'checkbox', defaultValue: true, index: true },
    { name: 'animation', type: 'json' },
    { name: 'fields', type: 'json', defaultValue: [] },
    { name: 'theme', type: 'json', required: true },
    { name: 'defaults', type: 'json' },
    { name: 'preview', type: 'json' },
    { name: 'html', type: 'code', required: true, admin: { language: 'html' } },
  ],
}
