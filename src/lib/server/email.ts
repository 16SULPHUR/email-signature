import { SITE_NAME } from '../site'

const site = () => (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export function emailLayout(title: string, body: string, cta?: { label: string; url: string }) {
  const button = cta
    ? `<tr><td style="padding:8px 0 24px;"><a href="${esc(cta.url)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;">${esc(cta.label)}</a></td></tr>`
    : ''
  return `<!DOCTYPE html><html><body style="margin:0;background:#f6f6f3;font-family:Arial,Helvetica,sans-serif;color:#17171c;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f6f3;padding:32px 16px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px;">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:16px;">✍ ${SITE_NAME}</td></tr>
<tr><td style="font-size:18px;font-weight:bold;padding-bottom:8px;">${esc(title)}</td></tr>
<tr><td style="font-size:15px;line-height:22px;color:#3f3f46;padding-bottom:16px;">${body}</td></tr>
${button}
<tr><td style="font-size:12px;color:#8a8a96;border-top:1px solid #eee;padding-top:16px;">${SITE_NAME} · <a href="${site()}" style="color:#8a8a96;">${site().replace(/^https?:\/\//, '')}</a></td></tr>
</table></td></tr></table></body></html>`
}

export const resetPasswordEmail = (token: string) =>
  emailLayout(
    'Reset your password',
    'Someone asked to reset the password for your account. If that was you, click the button below. The link expires in one hour. If it wasn’t you, you can ignore this email.',
    { label: 'Choose a new password', url: `${site()}/reset-password?token=${encodeURIComponent(token)}` },
  )

export const welcomeEmail = (name?: string) =>
  emailLayout(
    `Welcome${name ? `, ${esc(name)}` : ''}!`,
    `Your ${SITE_NAME} account is ready. Pick a template, fill in your details and click <b>Save to account</b> to keep your signatures on every device.`,
    { label: 'Browse templates', url: `${site()}/#templates` },
  )
