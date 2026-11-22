import { getPool } from '@/lib/server/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const key = id.replace(/\.(png|jpe?g)$/, '')
  if (!/^[\w-]{8,32}$/.test(key)) return new Response('Not found', { status: 404 })
  const pool = await getPool()
  const { rows } = await pool.query('select mime, data from signature_images where id = $1', [key])
  if (!rows[0]) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(rows[0].data), {
    headers: {
      'Content-Type': rows[0].mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
