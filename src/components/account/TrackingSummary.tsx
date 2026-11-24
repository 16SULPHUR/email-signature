'use client'

import Link from 'next/link'

import { PageHead } from '@/components/account/AccountShell'
import { useSummary } from '@/lib/client/account'

export function TrackingSummary() {
  const [data] = useSummary()
  const s = data?.summary
  return (
    <>
      <PageHead title="Tracking" hint="Emails you track with an open pixel, and the opens recorded for them." />
      <section className="panel acct__stack">
        <p>
          <strong>{s ? s.tracked : '…'}</strong> tracked emails · <strong>{s ? s.opens : '…'}</strong> opens recorded
        </p>
        <p className="hint">
          Create tracked emails, see who opened what and delete individual ones on the tracking page. Everything is
          deleted after 180 days.
        </p>
        <div>
          <Link href="/track" className="btn btn--primary">
            Open tracking
          </Link>
        </div>
      </section>
    </>
  )
}
