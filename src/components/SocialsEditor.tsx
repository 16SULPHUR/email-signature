'use client'

import { NETWORK_MAP, NETWORKS } from '@/lib/signature/networks'
import type { SocialLink } from '@/lib/signature/types'

export function SocialsEditor({ socials, onChange }: { socials: SocialLink[]; onChange: (s: SocialLink[]) => void }) {
  const update = (i: number, patch: Partial<SocialLink>) =>
    onChange(socials.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= socials.length) return
    const next = [...socials]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const unused = NETWORKS.find((n) => !socials.some((s) => s.network === n.id))

  return (
    <div className="socials">
      {socials.map((s, i) => (
        <div key={i} className="socials__row">
          <img src={`/icon/${s.network}.png?c=${NETWORK_MAP[s.network]?.color || '475569'}`} alt="" width={20} height={20} />
          <select
            className="input socials__net"
            value={s.network}
            onChange={(e) => update(i, { network: e.target.value })}
            aria-label="Network"
          >
            {NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            inputMode="url"
            placeholder={NETWORK_MAP[s.network]?.placeholder}
            value={s.url}
            onChange={(e) => update(i, { url: e.target.value })}
            aria-label={`${NETWORK_MAP[s.network]?.label} link`}
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
              disabled={i === socials.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onChange(socials.filter((_, j) => j !== i))}
              aria-label="Remove"
            >
              ✕
            </button>
          </span>
        </div>
      ))}
      <button
        type="button"
        className="btn btn--sm"
        onClick={() => onChange([...socials, { network: unused?.id || 'link', url: '' }])}
      >
        + Add link
      </button>
    </div>
  )
}
