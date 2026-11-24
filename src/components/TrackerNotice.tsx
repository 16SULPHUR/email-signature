import Link from 'next/link'

export function TrackerNotice() {
  return (
    <p className="hint hint--warn tracker__notice">
      Opens are approximate. Apple Mail and some other apps load images automatically, which can show an open nobody
      made, and recipients who block images are never counted. An open does not prove the email was read. Tell your
      recipients you use tracking where the law requires it. See the <Link href="/privacy">privacy policy</Link>.
    </p>
  )
}
