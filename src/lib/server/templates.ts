import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

import bundled from '@/generated/templates.json'
import type { Template } from '@/lib/signature/types'

const BUNDLED = bundled as Template[]

type Row = Omit<Template, 'id'> & { slug: string }

const fromRow = (r: Row): Template => ({
  ...r,
  id: r.slug,
  tags: (r.tags as string[]) || [],
  fields: (r.fields as Template['fields']) || [],
  defaults: r.defaults || undefined,
  preview: r.preview || undefined,
  description: r.description || '',
  animated: r.animated || undefined,
})

export async function getTemplates(): Promise<Template[]> {
  try {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'templates',
      where: { published: { equals: true } },
      limit: 500,
      depth: 0,
      pagination: false,
      sort: 'createdAt',
    })
    if (res.docs.length) return res.docs.map((d) => fromRow(d as unknown as Row))
  } catch {}
  return BUNDLED
}

export async function getTemplateById(id: string) {
  return (await getTemplates()).find((t) => t.id === id)
}

export async function seedTemplates(payload: Payload) {
  const existing = await payload.find({
    collection: 'templates',
    limit: 1000,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    select: { slug: true },
  })
  const have = new Set(existing.docs.map((d) => d.slug))
  for (const t of BUNDLED) {
    if (have.has(t.id)) continue
    const { id, ...rest } = t
    await payload.create({
      collection: 'templates',
      overrideAccess: true,
      data: { ...rest, slug: id } as never,
    })
  }
}
