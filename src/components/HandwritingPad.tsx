'use client'

import { useEffect, useRef, useState } from 'react'

import { api } from '@/lib/client/api'

const FONTS = ['Caveat', 'Dancing Script', 'Great Vibes']
const W = 400
const H = 160

type Props = {
  name: string
  value: string
  onChange: (url: string) => void
  onError: (msg: string) => void
}

export function HandwritingPad({ name, value, onChange, onError }: Props) {
  const [mode, setMode] = useState<'draw' | 'type' | null>(null)
  const [text, setText] = useState(name)
  const [font, setFont] = useState(FONTS[0])
  const [busy, setBusy] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  useEffect(() => {
    if (mode !== 'type') return
    const id = 'sig-script-fonts'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?${FONTS.map((f) => `family=${f.replace(' ', '+')}`).join('&')}&display=swap`
      document.head.appendChild(link)
    }
  }, [mode])

  useEffect(() => {
    if (mode !== 'type') return
    let cancelled = false
    document.fonts.load(`64px "${font}"`).then(() => {
      if (cancelled || !canvas.current) return
      const ctx = canvas.current.getContext('2d')!
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#111827'
      ctx.font = `64px "${font}"`
      ctx.textBaseline = 'middle'
      ctx.fillText(text, 12, H / 2, W - 24)
    })
    return () => {
      cancelled = true
    }
  }, [mode, text, font])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height]
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    const ctx = e.currentTarget.getContext('2d')!
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
    ctx.beginPath()
    const [x, y] = point(e)
    ctx.moveTo(x, y)
    ctx.lineTo(x + 0.1, y)
    ctx.stroke()
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const [x, y] = point(e)
    const ctx = e.currentTarget.getContext('2d')!
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const clear = () => canvas.current?.getContext('2d')!.clearRect(0, 0, W, H)

  const use = async () => {
    if (!canvas.current) return
    setBusy(true)
    try {
      const blob = await new Promise<Blob | null>((res) => canvas.current!.toBlob(res, 'image/png'))
      if (!blob) throw new Error('Nothing to save yet')
      onChange(await api.uploadImage(new File([blob], 'handwriting.png', { type: 'image/png' }), 'handwriting'))
      setMode(null)
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await api.uploadImage(file, 'handwriting'))
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="hand">
      {value && <img className="hand__preview" src={value} alt="Your handwritten signature" />}
      <div className="hand__tools">
        <button type="button" className="btn btn--sm" onClick={() => setMode(mode === 'draw' ? null : 'draw')}>
          Draw
        </button>
        <button type="button" className="btn btn--sm" onClick={() => setMode(mode === 'type' ? null : 'type')}>
          Type
        </button>
        <span className="btn btn--sm upload">
          Upload
          <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} />
        </span>
        {value && (
          <button type="button" className="btn btn--sm btn--text" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {mode && (
        <div className="hand__pad">
          {mode === 'type' && (
            <div className="field__row">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Signature text" />
              <select className="input" value={font} onChange={(e) => setFont(e.target.value)} aria-label="Script font">
                {FONTS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
          )}
          <canvas
            key={mode}
            ref={canvas}
            width={W}
            height={H}
            className="hand__canvas"
            onPointerDown={mode === 'draw' ? start : undefined}
            onPointerMove={mode === 'draw' ? move : undefined}
            onPointerUp={() => (drawing.current = false)}
            onPointerCancel={() => (drawing.current = false)}
          />
          <div className="hand__tools">
            <button type="button" className="btn btn--sm btn--primary" onClick={use} disabled={busy}>
              {busy ? '…' : 'Use this'}
            </button>
            {mode === 'draw' && (
              <button type="button" className="btn btn--sm" onClick={clear}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
