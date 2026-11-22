export const SITE_NAME = 'Signly'

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/$/,
    '',
  )
