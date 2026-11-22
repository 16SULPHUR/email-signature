import type { CollectionConfig } from 'payload'

import { isAdmin } from '../access'

export const CopyEvents: CollectionConfig = {
  slug: 'copy-events',
  admin: {
    useAsTitle: 'template',
    group: 'Analytics',
  },
  access: {
    create: () => true,
    read: isAdmin,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: 'template', type: 'text', required: true, index: true },
    { name: 'kind', type: 'select', options: ['rich', 'html', 'download'], defaultValue: 'rich' },
  ],
}
