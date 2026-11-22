'use client'

import type { Style, Template } from '@/lib/signature/types'

const FONTS = [
  { label: 'Template default', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Courier / mono', value: "'Courier New', Courier, monospace" },
]

const ICON_STYLES: { id: Style['iconStyle']; label: string }[] = [
  { id: 'brand', label: 'Brand' },
  { id: 'mono', label: 'Accent' },
  { id: 'badge', label: 'Brand badge' },
  { id: 'badgeMono', label: 'Accent badge' },
]

const COLORS: { key: 'accent' | 'text' | 'muted' | 'bg'; label: string }[] = [
  { key: 'accent', label: 'Accent' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Secondary' },
  { key: 'bg', label: 'Background' },
]

export function StyleEditor({
  template,
  style,
  onChange,
  onReset,
}: {
  template: Template
  style: Style
  onChange: (patch: Partial<Style>) => void
  onReset: () => void
}) {
  const usesAvatar = template.fields.includes('photoUrl')
  const usesLogo = template.fields.includes('logoUrl')
  const currentFont = FONTS.some((f) => f.value === style.font) ? style.font : ''

  return (
    <div className="style">
      <div className="style__colors">
        {COLORS.map((c) => (
          <label key={c.key} className="swatch">
            <input type="color" value={toHex(style[c.key])} onChange={(e) => onChange({ [c.key]: e.target.value })} />
            <span>{c.label}</span>
          </label>
        ))}
      </div>

      <div className="field">
        <label htmlFor="font">Font</label>
        <select
          id="font"
          className="input"
          value={currentFont}
          onChange={(e) => onChange({ font: e.target.value || template.theme.font })}
        >
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <span className="field__label">Social icon style</span>
        <div className="segmented" role="radiogroup">
          {ICON_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={style.iconStyle === s.id}
              className={style.iconStyle === s.id ? 'on' : ''}
              onClick={() => onChange({ iconStyle: s.id })}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="iconSize">Icon size · {style.iconSize}px</label>
        <input
          id="iconSize"
          type="range"
          min={12}
          max={36}
          value={style.iconSize}
          onChange={(e) => onChange({ iconSize: Number(e.target.value) })}
        />
      </div>

      {usesAvatar && (
        <div className="field">
          <label htmlFor="avatarSize">Photo size · {style.avatarSize}px</label>
          <input
            id="avatarSize"
            type="range"
            min={40}
            max={140}
            value={style.avatarSize}
            onChange={(e) => onChange({ avatarSize: Number(e.target.value) })}
          />
        </div>
      )}

      {usesAvatar && (
        <div className="field">
          <span className="field__label">Photo shape</span>
          <div className="segmented" role="radiogroup">
            {(['template', 'circle', 'rounded', 'square'] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={style.avatarShape === s}
                className={style.avatarShape === s ? 'on' : ''}
                onClick={() => onChange({ avatarShape: s })}
              >
                {s === 'template' ? 'Default' : s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {usesAvatar && (
        <div className="field">
          <label htmlFor="photoLink">Photo links to</label>
          <input
            id="photoLink"
            className="input"
            inputMode="url"
            placeholder="https://your-site.com (optional)"
            value={style.photoLink || ''}
            onChange={(e) => onChange({ photoLink: e.target.value })}
          />
        </div>
      )}

      {usesLogo && template.html.includes('logoWidth') && (
        <div className="field">
          <label htmlFor="logoWidth">Logo width · {style.logoWidth}px</label>
          <input
            id="logoWidth"
            type="range"
            min={48}
            max={200}
            value={style.logoWidth}
            onChange={(e) => onChange({ logoWidth: Number(e.target.value) })}
          />
        </div>
      )}

      <button type="button" className="btn btn--text btn--sm" onClick={onReset}>
        Reset to template style
      </button>
    </div>
  )
}

const toHex = (v: string) => {
  const c = (v || '').replace('#', '')
  if (/^[0-9a-f]{6}$/i.test(c)) return `#${c}`
  if (/^[0-9a-f]{3}$/i.test(c)) return `#${c.replace(/./g, (x) => x + x)}`
  return '#000000'
}
