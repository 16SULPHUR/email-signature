export const FIELD_KEYS = [
  'name',
  'title',
  'company',
  'department',
  'pronouns',
  'credentials',
  'license',
  'phone',
  'mobile',
  'email',
  'website',
  'websiteLabel',
  'address',
  'photoUrl',
  'logoUrl',
  'ctaText',
  'ctaUrl',
  'disclaimer',
  'tagline',
  'signoff',
] as const

export type FieldKey = (typeof FIELD_KEYS)[number]

export type Fields = Partial<Record<FieldKey, string>>

export type Theme = {
  accent: string
  text: string
  muted: string
  bg: string
  font: string
}

export type Style = Theme & {
  iconSize: number
  avatarSize: number
  iconStyle: 'brand' | 'mono' | 'badge' | 'badgeMono'
  avatarShape: 'template' | 'circle' | 'rounded' | 'square'
  logoWidth: number
  photoLink: string
}

export type SocialLink = {
  network: string
  url: string
}

export type CustomField = {
  label: string
  value: string
}

export type Extras = {
  utm?: boolean
  utmCampaign?: string
  bannerUrl?: string
  bannerLink?: string
  handwritingUrl?: string
}

export type SignatureData = {
  fields: Fields
  socials: SocialLink[]
  customFields?: CustomField[]
  extras?: Extras
  style: Partial<Style>
}

export type TemplateMeta = {
  id: string
  name: string
  category: string
  tags: string[]
  description: string
  width: number
  fields: FieldKey[]
  theme: Theme
  animated?: boolean
  animation?: { kind: string; width: number; height: number; params?: Record<string, string> }
  defaults?: Partial<Omit<Style, keyof Theme>> & { avatarRadius?: string }
  preview?: Partial<Pick<SignatureData, 'fields' | 'socials'>>
}

export type Template = TemplateMeta & { html: string }
