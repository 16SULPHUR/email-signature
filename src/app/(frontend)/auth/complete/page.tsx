import { Suspense } from 'react'

import { AuthComplete } from '@/components/AuthComplete'

export const metadata = { title: 'Signing in' }

export default function AuthCompletePage() {
  return (
    <Suspense>
      <AuthComplete />
    </Suspense>
  )
}
