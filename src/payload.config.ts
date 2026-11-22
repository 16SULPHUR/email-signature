import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { CopyEvents } from './collections/CopyEvents'
import { Signatures } from './collections/Signatures'
import { Submissions } from './collections/Submissions'
import { Templates } from './collections/Templates'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isPreview = process.env.VERCEL_ENV === 'preview'

export default buildConfig({
  admin: {
    user: Users.slug,
    components: { beforeLogin: ['@/components/AdminGoogleLogin#AdminGoogleLogin'] },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Signatures, Templates, Submissions, CopyEvents],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || '',
  cors: [process.env.NEXT_PUBLIC_SITE_URL || ''].filter(Boolean),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: false,
    prodMigrations: isPreview ? undefined : migrations,
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        apiKey: process.env.RESEND_API_KEY,
        defaultFromAddress: process.env.EMAIL_FROM || 'hello@sigrio.ankit.ninja',
        defaultFromName: 'Sigrio',
      })
    : undefined,
  onInit: async (payload) => {
    if (isPreview) return
    const { seedTemplates } = await import('./lib/server/templates')
    await seedTemplates(payload).catch((err) => payload.logger.error({ err }, 'template seed failed'))
  },
  sharp,
  plugins: [],
})
