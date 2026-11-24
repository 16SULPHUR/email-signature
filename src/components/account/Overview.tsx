'use client'

import Link from 'next/link'

import { PageHead } from '@/components/account/AccountShell'
import { formatBytes, useSummary } from '@/lib/client/account'

export function Overview() {
  const [data] = useSummary()
  const s = data?.summary
  const tiles: [string, string, string | undefined][] = [
    ['/account/signatures', 'Saved signatures', s && `${s.signatures}`],
    ['/account/uploads', 'Uploaded images', s && `${s.uploads} · ${formatBytes(s.upload_bytes)}`],
    ['/account/tracking', 'Tracked emails', s && `${s.tracked} · ${s.opens} opens`],
    ['/account/data', 'Stored editor entries', s && `${s.entries}`],
  ]
  return (
    <>
      <PageHead
        title="Account"
        hint={data ? `Member since ${new Date(data.user.createdAt).toLocaleDateString()}` : undefined}
      />
      <div className="acct__tiles">
        {tiles.map(([href, label, value]) => (
          <Link key={href} href={href} className="acct__tile">
            <span className="hint">{label}</span>
            <strong>{value ?? '…'}</strong>
          </Link>
        ))}
      </div>
      <div className="acct__links">
        <Link href="/account/profile">Edit name and password</Link>
        <Link href="/account/logins">Manage connected logins</Link>
        <Link href="/account/data">Export or delete your data</Link>
      </div>
    </>
  )
}
