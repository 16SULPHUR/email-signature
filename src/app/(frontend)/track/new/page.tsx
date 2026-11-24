import { TrackerNew } from '@/components/TrackerNew'
import { getTemplates } from '@/lib/server/templates'

export const metadata = { title: 'New tracked email' }
export const dynamic = 'force-dynamic'

export default async function NewTrackPage() {
  return <TrackerNew templates={await getTemplates()} />
}
