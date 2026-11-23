import { SAMPLE_FIELDS, SAMPLE_SOCIALS } from './fields'
import type { Fields, SignatureData, Template } from './types'

const EXTRA_KEYS = ['ctaText', 'ctaUrl', 'disclaimer', 'signoff'] as const

export function previewData(t: Template): SignatureData {
  const fields: Fields = { ...SAMPLE_FIELDS, ...t.preview?.fields }
  for (const k of EXTRA_KEYS) if (!t.fields.includes(k)) delete fields[k]
  return {
    fields,
    socials: t.preview?.socials?.length ? t.preview.socials : SAMPLE_SOCIALS,
    style: {},
  }
}
