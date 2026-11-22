import {
  charW,
  clamp,
  ease,
  fit,
  holdBlink,
  hold,
  initials,
  mix,
  rng,
  truncate,
  txt,
  typeSeq,
  typedState,
  windowBar,
  luminance,
  type Line,
} from './draw'
import type { Frame, Input, Scene } from './types'

const HOLD_START = 2600
const HOLD_END = 5200

const dark = (bg: string) => luminance(bg) < 0.5

function withEnds(final: string, seq: Frame[]): Frame[] {
  return [hold(final, HOLD_START), ...seq, hold(final, HOLD_END)]
}

function nameLine(i: Input, x: number, y: number, maxW: number, size: number, family: 'mono' | 'sans' = 'mono') {
  const f = fit(i.name, maxW, size, 14, family)
  return { text: f.text, size: f.size }
}

const role = (i: Input) => [i.title, i.company].filter(Boolean)

function terminal(): Scene {
  const W = 440
  const H = 172
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 18, 0, W - 36, 24)
      const r = role(i)
      const roleSegs = [
        { t: '// ', fill: pal.muted },
        { t: truncate(r[0] || '', 34), fill: pal.accent },
        ...(r[1] ? [{ t: ' @ ', fill: pal.muted }, { t: truncate(r[1], 24), fill: pal.text }] : []),
      ]
      const lines: Line[] = [
        { x: 18, y: 52, size: 13, segs: [{ t: '~', fill: pal.accent }, { t: ' $ whoami', fill: pal.muted }] },
        { x: 18, y: 84, size: n.size, weight: 700, segs: [{ t: n.text, fill: pal.text }] },
        { x: 18, y: 108, size: 13, segs: roleSegs },
        ...(i.tagline
          ? [{ x: 18, y: 130, size: 12, segs: [{ t: `# ${truncate(i.tagline, 50)}`, fill: pal.muted }] } as Line]
          : []),
        { x: 18, y: 154, size: 13, segs: [{ t: '~', fill: pal.accent }, { t: ' $ ', fill: pal.muted }] },
      ]
      const o = { base: windowBar(W, pal, 'zsh — signature'), cursor: pal.accent, step: 2 }
      const total = lines.reduce((s, l) => s + l.segs.reduce((a, g) => a + Array.from(g.t).length, 0), 0)
      const final = typedState(lines, total, o)
      return withEnds(final, [...typeSeq(lines, o), ...holdBlink(lines, o, 1, 400)])
    },
  }
}

function build(): Scene {
  const W = 440
  const H = 184
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const cmd = truncate(i.params.cmd || 'npm run build', 30)
      const done = truncate(i.params.done || 'Compiled successfully', 34)
      const bar = (pct: number) =>
        `<rect x="18" y="86" width="300" height="8" rx="4" fill="${mix(pal.bg, pal.text, 0.12)}"/>` +
        `<rect x="18" y="86" width="${Math.max(0, 300 * pct)}" height="8" rx="4" fill="${pal.accent}"/>` +
        txt(330, 94, `${Math.round(pct * 100)}%`, { size: 12, fill: pal.muted })
      const base = windowBar(W, pal, 'build')
      const cmdLine: Line = { x: 18, y: 52, size: 13, segs: [{ t: '$ ', fill: pal.accent }, { t: cmd, fill: pal.text }] }
      const status = txt(18, 76, '> compiling signature…', { size: 12, fill: pal.muted })
      const n = nameLine(i, 18, 0, W - 36, 22)
      const r = role(i)
      const out: Line[] = [
        { x: 18, y: 118, size: 12, segs: [{ t: '✓ ', fill: pal.accent }, { t: done, fill: pal.muted }] },
        { x: 18, y: 144, size: n.size, weight: 700, segs: [{ t: n.text, fill: pal.text }] },
        { x: 18, y: 166, size: 12, segs: [{ t: truncate(r.join(' · '), 56), fill: pal.accent }] },
      ]
      const total = out.reduce((s, l) => s + l.segs.reduce((a, g) => a + Array.from(g.t).length, 0), 0)
      const cmdOnly = typeSeq([cmdLine], { base, cursor: pal.accent, step: 2 })
      const cmdFull = typedState([cmdLine], 999, { base, cursor: pal.accent }, false)
      const progress: Frame[] = Array.from({ length: 11 }, (_, k) => ({
        svg: cmdFull + status + bar(k / 10),
        delay: k === 10 ? 200 : 90 + (k % 3) * 30,
      }))
      const baseDone = cmdFull + status + bar(1)
      const o = { base: baseDone, cursor: pal.accent, step: 3, delay: 45 }
      const final = typedState(out, total, o)
      return withEnds(final, [...cmdOnly, ...progress, ...typeSeq(out, o)])
    },
  }
}

function crt(): Scene {
  const W = 440
  const H = 170
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const scan = Array.from({ length: Math.ceil(H / 3) }, (_, k) => `<rect x="0" y="${k * 3}" width="${W}" height="1" fill="#000" opacity="0.28"/>`).join('')
      const overlay =
        `<defs><radialGradient id="vg" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.65"/></radialGradient>` +
        `<filter id="gl" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>`
      const post = scan + `<rect width="${W}" height="${H}" fill="url(#vg)"/>`
      const n = nameLine(i, 22, 0, W - 44, 26)
      const r = role(i)
      const lines: Line[] = [
        { x: 22, y: 34, size: 11, segs: [{ t: '> POWER ON ........ OK', fill: pal.muted }] },
        { x: 22, y: 52, size: 11, segs: [{ t: '> LOADING PROFILE ... OK', fill: pal.muted }] },
        { x: 22, y: 92, size: n.size, weight: 700, segs: [{ t: n.text, fill: pal.accent }] },
        { x: 22, y: 118, size: 13, segs: [{ t: truncate(`ROLE: ${r[0] || ''}`.toUpperCase(), 40), fill: pal.text }] },
        { x: 22, y: 138, size: 13, segs: [{ t: truncate(`ORG:  ${r[1] || ''}`.toUpperCase(), 40), fill: pal.text }] },
      ]
      const total = lines.reduce((s, l) => s + l.segs.reduce((a, g) => a + Array.from(g.t).length, 0), 0)
      const o = { base: overlay, cursor: pal.accent, step: 3, delay: 45 }
      const glowName = (op: number) =>
        txt(22, 92, n.text, { size: n.size, weight: 700, fill: pal.accent, opacity: op, extra: 'filter="url(#gl)"' })
      const withPost = (svg: string) => svg + post
      const final = withPost(typedState(lines, total, o, false) + glowName(0.8))
      const powerOn: Frame[] = [0.02, 0.05, 0.12, 0.4, 1].map((k, idx) => ({
        svg:
          overlay +
          `<rect x="${W / 2 - (W / 2) * (idx < 2 ? ease(idx / 2) : 1)}" y="${H / 2 - (H / 2) * k}" width="${W * (idx < 2 ? ease(idx / 2) : 1)}" height="${Math.max(2, H * k)}" fill="${pal.accent}" opacity="${idx === 4 ? 0.25 : 0.9}"/>` +
          post,
        delay: 60,
      }))
      const typed = typeSeq(lines, o).map((f) => ({ ...f, svg: withPost(f.svg + (f.svg.includes(n.text) ? glowName(0.7) : '')) }))
      const flicker: Frame[] = [0.85, 1, 0.9, 1].map((k) => ({
        svg: withPost(typedState(lines, total, o, false) + glowName(0.8 * k)),
        delay: 70,
      }))
      return withEnds(final, [...powerOn, ...typed, ...flicker])
    },
  }
}

function typename(): Scene {
  const W = 440
  const H = 80
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const sans = i.params.font === 'sans'
      const fam = sans ? 'sans' : 'mono'
      const n = nameLine(i, 18, 0, W - 36, 28, fam)
      const sub = truncate(role(i).join(' · '), 58)
      const lines: Line[] = [
        { x: 20, y: 40, size: n.size, weight: 700, family: fam, segs: [{ t: n.text, fill: pal.text }] },
        { x: 20, y: 64, size: 12.5, family: fam, segs: [{ t: sub, fill: pal.accent }] },
      ]
      const total = lines.reduce((s, l) => s + l.segs.reduce((a, g) => a + Array.from(g.t).length, 0), 0)
      const o = { cursor: pal.accent, step: 1, delay: 60 }
      const final = typedState(lines, total, o, true)
      const seq = typeSeq(lines, { ...o, step: 2 })
      return withEnds(final, [...seq, ...holdBlink(lines, o, 1, 400)])
    },
  }
}

function editor(): Scene {
  const W = 440
  const H = 178
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const gutter = pal.muted
      const cw = charW(13)
      const maxStr = Math.floor((W - 44 - 14) / cw) - 12
      const r = role(i)
      const bar =
        `<rect width="${W}" height="30" fill="${mix(pal.bg, dark(pal.bg) ? '#000' : '#000', dark(pal.bg) ? 0.25 : 0.05)}"/>` +
        `<rect x="0" y="0" width="118" height="30" fill="${pal.bg}"/><rect x="0" y="28" width="118" height="2" fill="${pal.accent}"/>` +
        txt(14, 19, 'profile.ts', { size: 11.5, fill: pal.text })
      const nums = [1, 2, 3, 4, 5]
        .map((k) => txt(28, 52 + (k - 1) * 22, String(k), { size: 12, fill: gutter, anchor: 'end', opacity: 0.7 }))
        .join('')
      const str = (s: string) => ({ t: `"${truncate(s, maxStr)}"`, fill: pal.accent2 })
      const lines: Line[] = [
        { x: 44, y: 52, size: 13, segs: [{ t: 'const ', fill: pal.accent }, { t: 'me', fill: pal.text }, { t: ' = {', fill: pal.muted }] },
        { x: 44, y: 74, size: 13, segs: [{ t: '  name: ', fill: pal.text }, str(i.name), { t: ',', fill: pal.muted }] },
        { x: 44, y: 96, size: 13, segs: [{ t: '  role: ', fill: pal.text }, str(r[0] || ''), { t: ',', fill: pal.muted }] },
        { x: 44, y: 118, size: 13, segs: [{ t: '  company: ', fill: pal.text }, str(r[1] || ''), { t: ',', fill: pal.muted }] },
        { x: 44, y: 140, size: 13, segs: [{ t: '}', fill: pal.muted }] },
      ]
      const total = lines.reduce((s, l) => s + l.segs.reduce((a, g) => a + Array.from(g.t).length, 0), 0)
      const o = { base: bar + nums, cursor: pal.accent, step: 3, delay: 45 }
      const final = typedState(lines, total, o)
      return withEnds(final, [...typeSeq(lines, o), ...holdBlink(lines, o, 1, 400)])
    },
  }
}

const GLYPHS = '01#$%&@ABCDEFGHJKMNPQRSTUVWXYZ<>/\\{}[]=+*'

function decode(): Scene {
  const W = 440
  const H = 116
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 20, 0, W - 40, 30)
      const chars = Array.from(n.text)
      const r = role(i)
      const rand = rng(i.name + i.title)
      const sub = (k: number) => {
        const t1 = truncate((r[0] || '').toUpperCase(), 40)
        const shown = Array.from(t1).slice(0, k).join('')
        return txt(22, 82, shown, { size: 12, fill: pal.accent, ls: 1.5 }) + txt(22, 100, truncate(r[1] || '', 46), { size: 11.5, fill: pal.muted, opacity: k >= Array.from(t1).length ? 1 : 0 })
      }
      const cw = charW(n.size)
      const draw = (locked: number, scramble: boolean) =>
        chars
          .map((c, idx) => {
            const x = 20 + idx * cw
            if (c === ' ') return ''
            if (idx < locked) return txt(x, 52, c, { size: n.size, weight: 700, fill: pal.text })
            if (!scramble) return ''
            const g = GLYPHS[Math.floor(rand() * GLYPHS.length)]
            return txt(x, 52, g, { size: n.size, weight: 700, fill: pal.accent, opacity: 0.55 })
          })
          .join('')
      const final = draw(chars.length, false) + sub(999)
      const seq: Frame[] = []
      const subLen = Array.from(r[0] || '').length
      for (let l = 0; l <= chars.length + 2; l++) seq.push({ svg: draw(Math.min(l, chars.length), true) + sub(0), delay: 55 })
      for (let k = 0; k <= subLen; k += 3) seq.push({ svg: draw(chars.length, false) + sub(k), delay: 40 })
      return withEnds(final, seq)
    },
  }
}

function shimmer(): Scene {
  const W = 440
  const H = 124
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 24, 0, W - 48, 32, 'sans')
      const r = role(i)
      const ruleW = 56
      const title = truncate((r[0] || '').toUpperCase(), 38)
      const name = (fill: string, extra = '') => txt(24, 58, n.text, { size: n.size, weight: 700, family: 'sans', fill, extra })
      const rule = (k: number) => `<rect x="24" y="72" width="${ruleW * k}" height="3" rx="1.5" fill="${pal.accent}"/>`
      const sub = (op: number) =>
        txt(24, 96, title, { size: 11.5, family: 'sans', fill: pal.accent, ls: 2, opacity: op }) +
        txt(24, 114, truncate(r[1] || '', 52), { size: 11.5, family: 'sans', fill: pal.muted, opacity: op })
      const sweep = (x: number) =>
        `<defs><linearGradient id="sh" gradientUnits="userSpaceOnUse" x1="${x - 70}" y1="0" x2="${x + 70}" y2="0"><stop offset="0" stop-color="${pal.accent2}" stop-opacity="0"/><stop offset="0.5" stop-color="${pal.accent2}" stop-opacity="1"/><stop offset="1" stop-color="${pal.accent2}" stop-opacity="0"/></linearGradient></defs>` +
        name('url(#sh)')
      const final = name(pal.text) + rule(1) + sub(1)
      const seq: Frame[] = []
      for (let k = 0; k <= 6; k++) seq.push({ svg: name(pal.text) + rule(ease(k / 6)), delay: 45 })
      for (const op of [0.35, 0.7, 1]) seq.push({ svg: name(pal.text) + rule(1) + sub(op), delay: 70 })
      const span = Array.from(n.text).length * charW(n.size, 'sans')
      for (let k = 0; k <= 12; k++) {
        const x = 24 - 70 + ((span + 140) * k) / 12
        seq.push({ svg: name(pal.text) + sweep(x) + rule(1) + sub(1), delay: 50 })
      }
      return withEnds(final, seq)
    },
  }
}

function neon(): Scene {
  const W = 440
  const H = 118
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 24, 0, W - 48, 34, 'sans')
      const r = role(i)
      const defs = `<defs><filter id="ng" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="5"/></filter></defs>`
      const sub = truncate(r.join('  ·  ').toUpperCase(), 44)
      const sign = (k: number, litChars?: number) => {
        const chars = Array.from(n.text)
        const shown = litChars === undefined ? n.text : chars.slice(0, litChars).join('')
        const dim = txt(24, 64, n.text, { size: n.size, weight: 700, family: 'sans', fill: mix(pal.bg, pal.accent, 0.14) })
        if (k <= 0) return dim + txt(24, 94, sub, { size: 11, family: 'sans', fill: mix(pal.bg, pal.muted, 0.35), ls: 3 })
        return (
          dim +
          txt(24, 64, shown, { size: n.size, weight: 700, family: 'sans', fill: pal.accent, opacity: 0.9 * k, extra: 'filter="url(#ng)"' }) +
          txt(24, 64, shown, { size: n.size, weight: 700, family: 'sans', fill: mix(pal.accent, '#ffffff', 0.55), opacity: k }) +
          txt(24, 94, sub, { size: 11, family: 'sans', fill: pal.muted, ls: 3, opacity: clamp(k + 0.1) })
        )
      }
      const final = defs + sign(1)
      const len = Array.from(n.text).length
      const pattern: [number, number | undefined][] = [
        [0, undefined],
        [0.7, Math.ceil(len * 0.4)],
        [0, undefined],
        [0.5, Math.ceil(len * 0.4)],
        [1, Math.ceil(len * 0.7)],
        [0.3, undefined],
        [1, undefined],
        [0.6, undefined],
        [1, undefined],
      ]
      const seq = pattern.map(([k, c], idx) => ({ svg: defs + sign(k, c), delay: idx % 2 ? 90 : 140 }))
      return withEnds(final, seq)
    },
  }
}

function chat(): Scene {
  const W = 440
  const H = 112
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const r = role(i)
      const ink = dark(pal.accent) ? '#ffffff' : '#111111'
      const greet = truncate(`Hi, I'm ${i.name}`, 34)
      const line2 = truncate(r.join(' · '), 44)
      const bw = (s: string, size: number) => Math.min(W - 90, Array.from(s).length * charW(size, 'sans') * 0.93 + 28)
      const avatar =
        `<circle cx="34" cy="48" r="20" fill="${pal.accent}"/>` +
        txt(34, 54, initials(i.name), { size: 14, weight: 700, family: 'sans', fill: ink, anchor: 'middle' })
      const bubble = (y: number, h: number, s: string, size: number, bold: boolean, fillBg: string, fillText: string, op = 1) =>
        `<g opacity="${op}"><rect x="66" y="${y}" width="${bw(s, size)}" height="${h}" rx="${h / 2.4}" fill="${fillBg}"/>` +
        txt(80, y + h / 2 + size * 0.35, s, { size, weight: bold ? 700 : 400, family: 'sans', fill: fillText }) +
        `</g>`
      const dots = (y: number, phase: number) =>
        `<rect x="66" y="${y}" width="58" height="28" rx="14" fill="${mix(pal.bg, pal.text, 0.1)}"/>` +
        [0, 1, 2]
          .map((k) => `<circle cx="${84 + k * 14}" cy="${y + 14 - (k === phase ? 3 : 0)}" r="3.5" fill="${pal.muted}" opacity="${k === phase ? 1 : 0.5}"/>`)
          .join('')
      const b1 = (op = 1) => bubble(18, 34, greet, 15, true, pal.accent, ink, op)
      const b2 = (op = 1) => bubble(60, 30, line2, 12.5, false, mix(pal.bg, pal.text, 0.1), pal.text, op)
      const final = avatar + b1() + b2()
      const seq: Frame[] = []
      for (let k = 0; k < 6; k++) seq.push({ svg: avatar + dots(22, k % 3), delay: 150 })
      seq.push({ svg: avatar + b1(), delay: 350 })
      for (let k = 0; k < 6; k++) seq.push({ svg: avatar + b1() + dots(62, k % 3), delay: 150 })
      seq.push({ svg: avatar + b1() + b2(0.5), delay: 80 })
      return withEnds(final, seq)
    },
  }
}

function ticker(): Scene {
  const W = 440
  const H = 76
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const r = role(i)
      const size = 17
      const cw = charW(size)
      const item = `${i.name}   ▲ ${r[0] || ''}${r[1] ? `   ● ${r[1]}` : ''}   ◆ `
      const unit = Array.from(item).length * cw
      const sub = i.tagline ? truncate(i.tagline.toUpperCase(), 54) : r.join(' · ').toUpperCase()
      const chrome =
        `<rect width="${W}" height="3" fill="${pal.accent}"/>` +
        txt(18, 66, truncate(sub, 56), { size: 10, fill: pal.muted, ls: 1 }) +
        `<rect x="0" y="40" width="${W}" height="1" fill="${mix(pal.bg, pal.text, 0.1)}" opacity="0"/>`
      const row = (off: number) => {
        let out = ''
        for (let k = 0; k < 3; k++) {
          const x = 18 - off + k * unit
          const parts = item.split(/(▲ [^●◆]*|● [^◆]*)/)
          let px = x
          for (const p of parts) {
            if (!p) continue
            const fill = p.startsWith('▲') ? pal.accent2 : p.startsWith('●') ? pal.muted : pal.text
            const weight = p.startsWith('▲') || p.startsWith('●') ? 400 : 700
            out += txt(px, 40, p, { size, fill, weight: weight as 400 | 700 })
            px += Array.from(p).length * cw
          }
        }
        return out
      }
      const mask = `<rect x="0" y="12" width="14" height="36" fill="${pal.bg}"/><rect x="${W - 14}" y="12" width="14" height="36" fill="${pal.bg}"/>`
      const frameAt = (off: number) => chrome + row(off) + mask
      const final = chrome + row(0)
      const seq: Frame[] = []
      const step = 15
      for (let off = step; off < unit; off += step) seq.push({ svg: frameAt(off), delay: 80 })
      return [hold(final, HOLD_START), ...seq]
    },
  }
}

function pulse(): Scene {
  const W = 440
  const H = 112
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 22, 0, W - 44, 24, 'sans')
      const r = role(i)
      const x0 = 22
      const x1 = W - 22
      const y = 94
      const beat = (ox: number) =>
        [[0, 0], [14, 0], [20, -5], [26, 0], [38, 0], [42, 5], [47, -24], [53, 14], [58, 0], [74, 0], [82, -8], [92, 0], [100, 0]].map(
          ([dx, dy]) => `${ox + dx},${y + dy}`,
        )
      const pts: string[] = []
      for (let ox = x0; ox < x1; ox += 100) pts.push(...beat(ox))
      const poly = (upto: number) => {
        const kept = pts.filter((p) => parseFloat(p) <= upto)
        return kept.length > 1 ? `<polyline points="${kept.join(' ')}" fill="none" stroke="${pal.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : ''
      }
      const text =
        txt(x0, 32, n.text, { size: n.size, weight: 700, family: 'sans', fill: pal.text }) +
        txt(x0, 50, truncate((r[0] || '').toUpperCase(), 42), { size: 11, family: 'sans', fill: pal.accent, ls: 1.5 }) +
        txt(x0, 65, truncate(r[1] || '', 52), { size: 11, family: 'sans', fill: pal.muted })
      const dot = (x: number) => {
        const near = pts.filter((p) => parseFloat(p) <= x).pop()
        const py = near ? parseFloat(near.split(',')[1]) : y
        return `<circle cx="${x}" cy="${py}" r="6" fill="${pal.accent}" opacity="0.25"/><circle cx="${x}" cy="${py}" r="3" fill="${pal.accent}"/>`
      }
      const baseline = `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="1" fill="${pal.muted}" opacity="0.25"/>`
      const final = text + baseline + poly(x1 + 1)
      const seq: Frame[] = []
      const steps = 22
      for (let k = 0; k <= steps; k++) {
        const x = x0 + ((x1 - x0) * k) / steps
        seq.push({ svg: text + baseline + poly(x) + dot(x), delay: 55 })
      }
      return withEnds(final, seq)
    },
  }
}

function skyline(): Scene {
  const W = 440
  const H = 124
  return {
    width: W,
    height: H,
    frames(i) {
      const { pal } = i
      const n = nameLine(i, 22, 0, 250, 24, 'sans')
      const r = role(i)
      const base = 108
      const blds = [
        { x: 292, w: 26, h: 46 },
        { x: 322, w: 30, h: 72 },
        { x: 356, w: 24, h: 56 },
        { x: 384, w: 34, h: 86 },
        { x: 268, w: 20, h: 34 },
      ]
      const text =
        txt(22, 40, n.text, { size: n.size, weight: 700, family: 'sans', fill: pal.text }) +
        txt(22, 62, truncate((r[0] || '').toUpperCase(), 26), { size: 11, family: 'sans', fill: pal.accent, ls: 1.5 }) +
        txt(22, 80, truncate(r[1] || '', 32), { size: 11.5, family: 'sans', fill: pal.muted })
      const ground = `<rect x="0" y="${base}" width="${W}" height="2" fill="${pal.accent}"/>`
      const city = (k: number, lit: number) =>
        blds
          .map((b, idx) => {
            const p = ease(clamp(k * 1.6 - idx * 0.18))
            const h = b.h * p
            const fill = mix(pal.bg, pal.accent, 0.25 + idx * 0.12)
            let wins = ''
            if (p > 0.95)
              for (let wy = base - b.h + 8; wy < base - 8; wy += 12)
                for (let wx = b.x + 5; wx < b.x + b.w - 6; wx += 9) {
                  const on = (Math.floor(wx + wy) + lit) % 3 === 0
                  wins += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="${on ? '#ffd966' : mix(fill, '#000', 0.25)}"/>`
                }
            return `<rect x="${b.x}" y="${base - h}" width="${b.w}" height="${h}" fill="${fill}"/>${wins}`
          })
          .join('')
      const final = text + ground + city(1, 0)
      const seq: Frame[] = []
      for (let k = 0; k <= 12; k++) seq.push({ svg: text + ground + city(k / 12, 0), delay: 55 })
      for (let l = 1; l <= 4; l++) seq.push({ svg: text + ground + city(1, l), delay: 220 })
      return withEnds(final, seq)
    },
  }
}

export const SCENES: Record<string, () => Scene> = {
  terminal,
  build,
  crt,
  typename,
  editor,
  decode,
  shimmer,
  neon,
  chat,
  ticker,
  pulse,
  skyline,
}

export const SCENE_KINDS = Object.keys(SCENES)

export const sceneSize = (kind: string) => {
  const s = SCENES[kind]?.()
  return s ? { width: s.width, height: s.height } : null
}

