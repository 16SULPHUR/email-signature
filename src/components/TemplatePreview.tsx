'use client'

import { useAllFormFields } from '@payloadcms/ui'
import { useMemo } from 'react'

import { SignatureFrame } from '@/components/SignatureFrame'
import { previewData } from '@/lib/signature/preview'
import { renderSignature } from '@/lib/signature/render'
import type { Template } from '@/lib/signature/types'

const parse = (v: unknown) => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return undefined
  }
}

export function TemplatePreview() {
  const [fields] = useAllFormFields()
  const val = (k: string) => fields[k]?.value
  const html = String(val('html') || '')
  const source = JSON.stringify([val('theme'), val('defaults'), val('preview'), val('animation'), val('slug'), val('width')])

  const rendered = useMemo(() => {
    const [theme, defaults, preview, animation, slug, width] = JSON.parse(source)
    const t = {
      id: slug || 'preview',
      name: '',
      category: '',
      tags: [],
      description: '',
      width: Number(width) || 520,
      fields: [],
      theme: parse(theme) || {},
      defaults: parse(defaults) || undefined,
      preview: parse(preview) || undefined,
      animation: parse(animation) || undefined,
      html,
    } as Template
    try {
      return renderSignature(t, previewData(t), window.location.origin)
    } catch (err) {
      return `<p style="color:#b91c1c">${(err as Error).message}</p>`
    }
  }, [html, source])

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <label className="field-label">Preview</label>
      <div style={{ background: '#fff', border: '1px solid var(--theme-elevation-150)', padding: 24, overflow: 'auto' }}>
        <SignatureFrame html={rendered} fit />
      </div>
    </div>
  )
}
