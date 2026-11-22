import type { Template } from './types'

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

export const categoriesOf = (list: Template[]) =>
  Array.from(new Set(list.map((t) => t.category))).sort(
    (a, b) => list.filter((t) => t.category === b).length - list.filter((t) => t.category === a).length,
  )
