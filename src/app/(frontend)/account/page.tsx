import { Account } from '@/components/Account'
import { getTemplates } from '@/lib/server/templates'

export const metadata = { title: 'My signatures' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  return <Account templates={await getTemplates()} />
}
