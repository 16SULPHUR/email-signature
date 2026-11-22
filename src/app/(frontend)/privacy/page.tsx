import { SITE_NAME } from '@/lib/site'

export const metadata = { title: `Privacy policy · ${SITE_NAME}` }

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>Privacy policy</h1>
      <p className="hint">Last updated 22 November 2026</p>

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

      <h2>Your choices</h2>
      <p>
        Don&apos;t type details you don&apos;t want stored. To see, correct or delete the data we hold about you, or to
        withdraw your consent, email <a href="mailto:ankit@ankit.ninja">ankit@ankit.ninja</a> and we&apos;ll act on it
        within 30 days.
      </p>
    </article>
  )
}
