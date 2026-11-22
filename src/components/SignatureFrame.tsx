'use client'

import { useEffect, useRef, useState } from 'react'

export function SignatureFrame({ html, fit = false, dark = false }: { html: string; fit?: boolean; dark?: boolean }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number>()

  useEffect(() => {
    if (!fit || !outer.current || !inner.current) return
    const measure = () => {
      const o = outer.current!.clientWidth
      const i = inner.current!.scrollWidth
      const s = i > o ? o / i : 1
      setScale(s)
      setHeight(inner.current!.scrollHeight * s)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(outer.current)
    ro.observe(inner.current)
    return () => ro.disconnect()
  }, [fit, html])

  return (
    <div ref={outer} className={`sig-frame${dark ? ' sig-frame--dark' : ''}`} style={fit ? { height } : undefined}>
      <div
        ref={inner}
        className="sig-frame__inner"
        style={fit ? { transform: `scale(${scale})`, transformOrigin: 'top left', width: 'max-content' } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
