import Link from 'next/link'
import React from 'react'

import { AuthNav } from '@/components/AuthNav'
import { SITE_NAME } from '@/lib/site'

import './styles.css'

export const metadata = {
  title: `${SITE_NAME}: free email signature generator`,
  description:
    'Pick an email signature template for your industry, fill in your details and paste it into Gmail, Outlook or Apple Mail. No signup needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <Link href="/" className="nav__brand">
            <span className="nav__logo">✍</span> {SITE_NAME}
          </Link>
          <nav className="nav__links">
            <Link href="/#templates" className="nav__link">
              Templates
            </Link>
            <AuthNav />
          </nav>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <p>
            {SITE_NAME} is free to use. No account needed: your details stay in your browser unless you choose to
            save them.
          </p>
        </footer>
      </body>
    </html>
  )
}
