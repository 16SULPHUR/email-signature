import { TrackedDetailView } from '@/components/TrackedDetailView'

export const metadata = { title: 'Tracked email' }
export const dynamic = 'force-dynamic'

export default async function TrackedEmailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TrackedDetailView id={id} />
}
