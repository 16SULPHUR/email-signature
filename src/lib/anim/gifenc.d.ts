declare module 'gifenc' {
  type Rgb = [number, number, number]
  export function quantize(data: Uint8Array | Uint8ClampedArray, maxColors: number, opts?: { format?: string }): Rgb[]
  export function applyPalette(data: Uint8Array | Uint8ClampedArray, palette: Rgb[], format?: string): Uint8Array
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: {
        palette?: Rgb[]
        delay?: number
        repeat?: number
        transparent?: boolean
        transparentIndex?: number
        dispose?: number
      },
    ): void
    finish(): void
    bytes(): Uint8Array
  }
}
