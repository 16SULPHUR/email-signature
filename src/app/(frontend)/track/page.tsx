import { Tracker } from '@/components/Tracker'
import { getTemplates } from '@/lib/server/templates'

export const metadata = { title: 'Tracked emails' }
export const dynamic = 'force-dynamic'

export default async function TrackPage() {
  return <Tracker templates={await getTemplates()} />
}
