import { siteUrl } from '@/lib/site'

export const pixelHtml = (id: string) =>
  `<img src="${siteUrl()}/t/${id}.gif" width="1" height="1" alt="" style="display:block;border:0;width:1px;height:1px">`

export const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)} min ago`
  if (s < 86400) return `${Math.round(s / 3600)} h ago`
  return `${Math.round(s / 86400)} d ago`
}

export const fullDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export const recipientLabel = (name: string | null, email: string | null) => name || email || 'No recipient'
