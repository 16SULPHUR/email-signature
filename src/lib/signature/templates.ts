import data from '@/generated/templates.json'

import type { Template } from './types'

export const TEMPLATES = data as Template[]

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id)

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  developer: 'Developer',
  designer: 'Designer',
  executive: 'Executive',
  'real-estate': 'Real estate',
  legal: 'Legal',
  healthcare: 'Healthcare',
  sales: 'Sales',
  marketing: 'Marketing',
  creator: 'Creator',
  education: 'Education',
  finance: 'Finance',
  hospitality: 'Hospitality',
  nonprofit: 'Nonprofit',
  student: 'Student',
}

export const categoryLabel = (id: string) =>
  CATEGORY_LABELS[id] || id.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

export const CATEGORIES = Array.from(new Set(TEMPLATES.map((t) => t.category))).sort(
  (a, b) => TEMPLATES.filter((t) => t.category === b).length - TEMPLATES.filter((t) => t.category === a).length,
)
