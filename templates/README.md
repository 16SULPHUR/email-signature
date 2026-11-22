# Signature templates

Each template is `SLUG/meta.json` + `SLUG/template.html`; `index.json` lists the slugs.

`template.html` is email-safe table markup with inline styles, rendered with Mustache (double braces only).

- Scalars: name, title, company, department, pronouns, credentials, license, phone, mobile, email, website, websiteLabel, address, photoUrl, logoUrl, ctaText, ctaUrl, disclaimer, tagline
- Theme: accent, text, muted, bg, font, iconSize, avatarSize (defaults in `meta.theme`)
- Icons: phoneIcon, emailIcon, webIcon, addressIcon
- `socials`: list of { network, url, label, icon, iconMono }; templates test `socials.length` to hide the row

`meta.preview` holds template-specific sample data.
