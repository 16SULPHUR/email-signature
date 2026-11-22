export type Palette = { bg: string; text: string; muted: string; accent: string; accent2: string }

export type Input = {
  name: string
  title: string
  company: string
  tagline: string
  pal: Palette
  params: Record<string, string>
}

export type Frame = { svg: string; delay: number }

export type Scene = {
  width: number
  height: number
  frames: (input: Input) => Frame[]
}
