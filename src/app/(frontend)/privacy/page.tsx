import { SITE_NAME } from '@/lib/site'

export const metadata = { title: `Privacy policy · ${SITE_NAME}` }

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>Privacy policy</h1>
      <p className="hint">Last updated 24 November 2026</p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Signature details you type into the editor</strong>: name, job title, company, phone numbers, email,
          website, address, social links, custom fields, style choices and the template you pick. These are sent to
          our servers as you type, whether or not you have an account.
        </li>
        <li>
          <strong>Images you upload</strong> (photo or logo), stored so they can be shown in your signature.
        </li>
        <li>
          <strong>Account details</strong> if you sign up: your name, email and a hashed password, plus the
          signatures you save.
        </li>
        <li>
          <strong>Basic usage</strong>: which templates are copied, and a hashed form of your IP address to rate-limit
          uploads. A random ID stored in your browser links your edits together.
        </li>
        <li>
          <strong>Email open tracking</strong>, only if you create a tracked email while signed in. For each tracked
          email we store the subject and recipient name or email you typed. When the tracking pixel in that email is
          loaded, we record the time, a rough device type, an approximate city and country, and a hashed form of the
          viewer&apos;s IP address. We never store the raw IP address. Tracked emails and their opens are visible only
          to the account that created them and are deleted after 180 days or when you delete them.
        </li>
        <li>
          <strong>Sending email from {SITE_NAME}</strong>, only if you connect Gmail. We request permission to send
          email only, not to read your mail. We store your Gmail address and an encrypted refresh token so we can send
          on your behalf until you disconnect. When you send, your message passes through our server to Gmail and is
          not stored; we keep only the subject and recipient as a tracked email. You can revoke access at any time
          from the compose page or your Google account.
        </li>
      </ul>

      <h2>Why we collect it</h2>
      <p>
        To run {SITE_NAME}: host your images, keep your saved signatures, prevent abuse, and understand which templates
        and features people use so we can improve them. We may use the contact details you enter to contact you about{' '}
        {SITE_NAME}. We do not sell your personal data.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Data is stored with our hosting providers (Vercel and Neon) in Singapore. Images in your signature are public
        to anyone who receives an email with it.
      </p>

      <h2>If you received a tracked email</h2>
      <p>
        An email you received may contain a tiny invisible image that tells its sender when it was opened. Opens are
        approximate: mail apps such as Apple Mail and Gmail may load the image automatically, and blocking remote
        images in your mail app stops the tracking. To ask us to delete the tracking data about you, email{' '}
        <a href="mailto:ankit@ankit.ninja">ankit@ankit.ninja</a>. Senders using tracking are responsible for telling
        their recipients where the law requires it.
      </p>

      <h2>Your choices</h2>
      <p>
        Don&apos;t type details you don&apos;t want stored. If you have an account, you can see, export and delete your
        data yourself under <a href="/account/data">Account → Data &amp; privacy</a>. For anything else, or to withdraw
        your consent, email <a href="mailto:ankit@ankit.ninja">ankit@ankit.ninja</a> and we&apos;ll act on it within 30
        days.
      </p>
    </article>
  )
}
