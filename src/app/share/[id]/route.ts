import { getPool } from '@/lib/server/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[\w-]{6,12}$/.test(id)) return Response.json({ error: 'Not found' }, { status: 404 })
  const pool = await getPool()
  const { rows } = await pool.query('select template, data from shared_signatures where id = $1', [id])
  if (!rows[0]) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(rows[0], { headers: { 'Cache-Control': 'public, max-age=300' } })
}
