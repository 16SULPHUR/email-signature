import type { CollectionConfig } from 'payload'

import { adminOrOwner, loggedIn } from '../access'

export const Signatures: CollectionConfig = {
  slug: 'signatures',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'template', 'owner', 'updatedAt'],
  },
  access: {
    create: loggedIn,
    read: adminOrOwner,
    update: adminOrOwner,
    delete: adminOrOwner,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'template', type: 'text', required: true, index: true },
    { name: 'data', type: 'json', required: true },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      admin: { readOnly: true },
      hooks: {
        beforeChange: [({ req, value, operation }) => (operation === 'create' ? req.user?.id : value)],
      },
    },
  ],
}
