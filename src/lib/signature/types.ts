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
}

export type SocialLink = {
  network: string
  url: string
}

export type SignatureData = {
  fields: Fields
  socials: SocialLink[]
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
  defaults?: Partial<Omit<Style, keyof Theme>>
  preview?: Partial<Pick<SignatureData, 'fields' | 'socials'>>
}

export type Template = TemplateMeta & { html: string }
