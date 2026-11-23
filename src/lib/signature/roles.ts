export const ROLES = [
  { slug: 'real-estate-agents', label: 'real estate agents', category: 'real-estate' },
  { slug: 'lawyers', label: 'lawyers', category: 'legal' },
  { slug: 'doctors', label: 'doctors and clinics', category: 'healthcare' },
  { slug: 'developers', label: 'developers', category: 'developer' },
  { slug: 'designers', label: 'designers', category: 'designer' },
  { slug: 'teachers', label: 'teachers and educators', category: 'education' },
  { slug: 'accountants', label: 'accountants and finance teams', category: 'finance' },
  { slug: 'founders', label: 'startup founders', category: 'startup' },
  { slug: 'executives', label: 'executives', category: 'executive' },
  { slug: 'recruiters', label: 'recruiters', category: 'recruiting' },
  { slug: 'sales-reps', label: 'sales reps', category: 'sales' },
  { slug: 'marketers', label: 'marketers', category: 'marketing' },
  { slug: 'consultants', label: 'consultants', category: 'consulting' },
  { slug: 'content-creators', label: 'content creators', category: 'creator' },
  { slug: 'hospitality', label: 'hotels and restaurants', category: 'hospitality' },
] as const

export const roleBySlug = (slug: string) => ROLES.find((r) => r.slug === slug)
