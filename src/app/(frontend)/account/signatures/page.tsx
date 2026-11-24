import { SignaturesList } from '@/components/account/SignaturesList'
import { getTemplates } from '@/lib/server/templates'

export const metadata = { title: 'My signatures' }
export const dynamic = 'force-dynamic'

export default async function Page() {
  return <SignaturesList templates={await getTemplates()} />
}
