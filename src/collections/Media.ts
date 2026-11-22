import type { CollectionConfig } from 'payload'

import { adminOrOwner, loggedIn } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: loggedIn,
    update: adminOrOwner,
    delete: adminOrOwner,
  },
  fields: [
    { name: 'alt', type: 'text' },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
      hooks: {
        beforeChange: [({ req, value, operation }) => (operation === 'create' ? req.user?.id : value)],
      },
    },
  ],
  upload: {
    mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    imageSizes: [{ name: 'avatar', width: 240, height: 240, position: 'centre' }],
  },
}
