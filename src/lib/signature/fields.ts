import type { FieldKey } from './types'

type FieldDef = {
  label: string
  placeholder: string
  group: 'identity' | 'contact' | 'media' | 'extras'
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea'
}

export const FIELDS: Record<FieldKey, FieldDef> = {
  name: { label: 'Full name', placeholder: 'Jordan Lee', group: 'identity' },
  title: { label: 'Job title', placeholder: 'Product Designer', group: 'identity' },
  company: { label: 'Company', placeholder: 'Northwind Labs', group: 'identity' },
  department: { label: 'Department', placeholder: 'Design', group: 'identity' },
  pronouns: { label: 'Pronouns', placeholder: 'they/them', group: 'identity' },
  tagline: { label: 'Tagline', placeholder: 'Making the complex feel simple', group: 'identity' },
  phone: { label: 'Phone', placeholder: '+1 555 010 2030', group: 'contact', type: 'tel' },
  mobile: { label: 'Mobile', placeholder: '+1 555 010 4050', group: 'contact', type: 'tel' },
  email: { label: 'Email', placeholder: 'jordan@northwind.com', group: 'contact', type: 'email' },
  website: { label: 'Website', placeholder: 'northwind.com', group: 'contact', type: 'url' },
  websiteLabel: { label: 'Website label', placeholder: 'northwind.com', group: 'contact' },
  address: { label: 'Address', placeholder: '120 Market St, San Francisco', group: 'contact' },
  photoUrl: { label: 'Photo URL', placeholder: 'https://…/me.jpg', group: 'media', type: 'url' },
  logoUrl: { label: 'Logo URL', placeholder: 'https://…/logo.png', group: 'media', type: 'url' },
  ctaText: { label: 'Button text', placeholder: 'Book a call', group: 'extras' },
  ctaUrl: { label: 'Button link', placeholder: 'https://calendly.com/you', group: 'extras', type: 'url' },
  disclaimer: {
    label: 'Disclaimer',
    placeholder: 'This email and any attachments are confidential…',
    group: 'extras',
    type: 'textarea',
  },
}

export const FIELD_GROUPS = [
  { id: 'identity', label: 'About you' },
  { id: 'contact', label: 'Contact' },
  { id: 'media', label: 'Photo & logo' },
  { id: 'extras', label: 'Button & disclaimer' },
] as const

export const SAMPLE_FIELDS = {
  name: 'Jordan Lee',
  title: 'Product Designer',
  company: 'Northwind Labs',
  department: 'Design',
  pronouns: 'they/them',
  phone: '+1 555 010 2030',
  mobile: '+1 555 010 4050',
  email: 'jordan@northwind.com',
  website: 'northwind.com',
  address: '120 Market St, San Francisco',
  photoUrl: '',
  logoUrl: '',
  ctaText: 'Book a call',
  ctaUrl: 'https://calendly.com',
  disclaimer: '',
  tagline: 'Making the complex feel simple',
}

export const SAMPLE_SOCIALS = [
  { network: 'linkedin', url: 'https://linkedin.com/in/jordanlee' },
  { network: 'x', url: 'https://x.com/jordanlee' },
  { network: 'github', url: 'https://github.com/jordanlee' },
  { network: 'instagram', url: 'https://instagram.com/jordanlee' },
]
