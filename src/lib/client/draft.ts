import type { SignatureData } from '@/lib/signature/types'

const KEY = 'sig:draft:v1'

type Stored = Pick<SignatureData, 'fields' | 'socials'> & { styles: Record<string, SignatureData['style']> }

export function loadDraft(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stored) : null
  } catch {
    return null
  }
}

export function saveDraft(templateId: string, data: SignatureData) {
  try {
    const prev = loadDraft()
    const next: Stored = {
      fields: data.fields,
      socials: data.socials,
      styles: { ...prev?.styles, [templateId]: data.style },
    }
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
