import { SAMPLE_FIELDS, SAMPLE_SOCIALS } from './fields'
import type { SignatureData, Template } from './types'

export function previewData(t: Template): SignatureData {
  return {
    fields: { ...SAMPLE_FIELDS, ...t.preview?.fields },
    socials: t.preview?.socials?.length ? t.preview.socials : SAMPLE_SOCIALS,
    style: {},
  }
}
