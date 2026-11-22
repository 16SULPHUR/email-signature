import { createNeonAuth } from '@neon/auth/next/server'

export const neonAuthEnabled = Boolean(
  process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET,
)

export const neonAuth = neonAuthEnabled
  ? createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET!, sameSite: 'lax' },
      logLevel: 'error',
    })
  : null
