import { JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/Logo'
import { AuthNav } from '@/components/AuthNav'
import { SITE_NAME } from '@/lib/site'

import './styles.css'

const sans = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: `${SITE_NAME}: free email signature generator`,
  icons: { icon: '/logo.svg' },
  description:
    'Pick an email signature template for your industry, fill in your details and paste it into Gmail, Outlook or Apple Mail. No signup needed.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <header className="nav">
          <div className="nav__inner">
            <Link href="/" className="nav__brand">
              <Logo size={28} />
              {SITE_NAME.toLowerCase()}
            </Link>
            <nav className="nav__links">
              <Link href="/templates" className="nav__link">
                templates
              </Link>
              <AuthNav />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="footer__inner">
            <span className="footer__live">free</span>
            <span>
              {SITE_NAME.toLowerCase()} © {new Date().getFullYear()}
            </span>
            <Link href="/privacy" className="footer__spacer">
              privacy
            </Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
