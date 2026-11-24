import { TrackerDetail } from '@/components/TrackerDetail'

export const metadata = { title: 'Tracked email' }

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TrackerDetail id={id} />
}
