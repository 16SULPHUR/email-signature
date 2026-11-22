import path from 'node:path'

import { Resvg } from '@resvg/resvg-js'
import { GIFEncoder, applyPalette, quantize } from 'gifenc'

import type { Frame, Input, Scene } from './types'

const FONT_DIR = path.join(process.cwd(), 'src/assets/fonts')
const FONT_FILES = ['JetBrainsMono-Regular.ttf', 'JetBrainsMono-Bold.ttf', 'Inter-Regular.ttf', 'Inter-Bold.ttf'].map((f) =>
  path.join(FONT_DIR, f),
)

type Raster = { data: Uint8Array; width: number; height: number }

function rasterize(scene: Scene, bg: string, frame: Frame, scale: number): Raster {
  const { width: w, height: h } = scene
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${frame.svg}</svg>`
  const img = new Resvg(svg, {
    fitTo: { mode: 'width', value: Math.round(w * scale) },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'JetBrains Mono' },
  }).render()
  return { data: new Uint8Array(img.pixels), width: img.width, height: img.height }
}

function samplePixels(rasters: Raster[]) {
  const picks = rasters.length <= 8 ? rasters : Array.from({ length: 8 }, (_, i) => rasters[Math.floor((i * (rasters.length - 1)) / 7)])
  const stride = 2
  const parts: Uint8Array[] = []
  for (const r of picks) {
    const out = new Uint8Array(Math.ceil(r.data.length / 4 / stride) * 4)
    let o = 0
    for (let p = 0; p < r.data.length; p += 4 * stride) {
      out[o++] = r.data[p]
      out[o++] = r.data[p + 1]
      out[o++] = r.data[p + 2]
      out[o++] = 255
    }
    parts.push(out.subarray(0, o))
  }
  const total = parts.reduce((n, p) => n + p.length, 0)
  const all = new Uint8Array(total)
  let at = 0
  for (const p of parts) {
    all.set(p, at)
    at += p.length
  }
  return all
}

export function encodeGif(scene: Scene, input: Input, opts: { scale: number; loop: number }): Uint8Array {
  const frames = scene.frames(input)
  const rasters = frames.map((f) => rasterize(scene, input.pal.bg, f, opts.scale))
  const { width, height } = rasters[0]

  const palette = quantize(samplePixels(rasters), 255, { format: 'rgb565' })
  while (palette.length < 256) palette.push([0, 0, 0])
  const transparentIndex = 255

  const gif = GIFEncoder()
  let prev: Uint8Array | null = null
  rasters.forEach((r, i) => {
    const index = applyPalette(r.data, palette.slice(0, 255), 'rgb565') as Uint8Array
    const current = index.slice()
    if (prev) for (let p = 0; p < index.length; p++) if (index[p] === prev[p]) index[p] = transparentIndex
    gif.writeFrame(index, width, height, {
      palette: i === 0 ? palette : undefined,
      delay: frames[i].delay,
      repeat: opts.loop,
      transparent: prev !== null,
      transparentIndex,
      dispose: 1,
    })
    prev = current
  })
  gif.finish()
  return gif.bytes()
}
