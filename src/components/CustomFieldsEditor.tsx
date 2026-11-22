'use client'

import type { CustomField } from '@/lib/signature/types'

export function CustomFieldsEditor({ items, onChange }: { items: CustomField[]; onChange: (c: CustomField[]) => void }) {
  const update = (i: number, patch: Partial<CustomField>) =>
    onChange(items.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="socials">
      {items.map((c, i) => (
        <div key={i} className="socials__row socials__row--custom">
          <input
            className="input"
            placeholder="Label, e.g. Office hours"
            value={c.label}
            onChange={(e) => update(i, { label: e.target.value })}
            aria-label="Label"
          />
          <input
            className="input"
            placeholder="Value, e.g. Mon–Fri 9–5"
            value={c.value}
            onChange={(e) => update(i, { value: e.target.value })}
            aria-label="Value"
          />
          <span className="socials__tools">
            <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
              ↑
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => move(i, 1)}
              aria-label="Move down"
              disabled={i === items.length - 1}
            >
              ↓
            </button>
            <button type="button" className="icon-btn" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove">
              ✕
            </button>
          </span>
        </div>
      ))}
      <button type="button" className="btn btn--sm" onClick={() => onChange([...items, { label: '', value: '' }])}>
        + Add field
      </button>
    </div>
  )
}
