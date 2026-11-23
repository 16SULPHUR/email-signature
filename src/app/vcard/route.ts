const esc = (v: string | null) => (v || '').replace(/[\;,]/g, (c) => `\\${c}`).replace(/[\r\n]+/g, ' ').slice(0, 200)

export function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const name = esc(q.get('n'))
  if (!name) return new Response('Missing name', { status: 400 })
  const [first, ...rest] = name.split(' ')
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${rest.join(' ')};${first};;;`,
    q.get('t') && `TITLE:${esc(q.get('t'))}`,
    q.get('o') && `ORG:${esc(q.get('o'))}`,
    q.get('p') && `TEL;TYPE=WORK,VOICE:${esc(q.get('p'))}`,
    q.get('m') && `TEL;TYPE=CELL:${esc(q.get('m'))}`,
    q.get('e') && `EMAIL;TYPE=INTERNET:${esc(q.get('e'))}`,
    q.get('w') && `URL:${esc(q.get('w'))}`,
    q.get('a') && `ADR;TYPE=WORK:;;${esc(q.get('a'))};;;;`,
    'END:VCARD',
  ].filter(Boolean)
  const file = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'contact'
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${file}.vcf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
