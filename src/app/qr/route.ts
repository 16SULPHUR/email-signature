import QRCode from 'qrcode'

const HEX = /^[0-9a-fA-F]{6}$/

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const data = q.get('d') || ''
  if (!data || data.length > 600) return new Response('Bad request', { status: 400 })
  const color = HEX.test(q.get('c') || '') ? q.get('c')! : '111827'
  const png = await QRCode.toBuffer(data, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: `#${color}`, light: '#FFFFFF' },
  })
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
