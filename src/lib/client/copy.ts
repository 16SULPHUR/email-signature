import { toPlainText } from '@/lib/signature/render'

export async function copyRich(html: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([toPlainText(html)], { type: 'text/plain' }),
      }),
    ])
    return
  } catch {}
  const el = document.createElement('div')
  el.innerHTML = html
  el.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff'
  document.body.appendChild(el)
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
  document.execCommand('copy')
  sel?.removeAllRanges()
  el.remove()
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

export function downloadHtml(html: string, filename: string) {
  const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Email signature</title></head><body>${html}</body></html>`
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
