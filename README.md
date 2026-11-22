# Email Signature Creator

Free email signature generator. Visitors browse templates by industry, role or style, fill in their details, customize colours, icons and links, and copy a signature that works in Gmail, Outlook, Apple Mail, Yahoo and Thunderbird. Accounts are optional.

Stack: Next.js 16, Payload CMS 3 (admin at `/admin`), Postgres on Neon.

## Run locally

```bash
pnpm install
cp .env.example .env   # fill DATABASE_URL, PAYLOAD_SECRET, NEXT_PUBLIC_SITE_URL, ADMIN_EMAILS
pnpm payload migrate
pnpm dev
```

`ADMIN_EMAILS` (comma separated) decides who gets the admin role on signup. Everyone else is a regular user.

In production, migrations in `src/migrations` run automatically when Payload starts.

## Templates

Templates live in `templates/SLUG/` (`meta.json` + `template.html`) and are listed in `templates/index.json`. See `templates/README.md` for the format and the variables a template can use. `pnpm templates` validates and bundles them into `src/generated/templates.json`; this also runs before `dev` and `build`.

## How it fits together

- `src/lib/signature/render.ts` turns a template + the user's data into email-safe HTML (Mustache, escaped values, sanitized links).
- `/icon/NAME.png?c=HEX&bg=HEX&r=RADIUS` renders social and contact icons as PNGs (Gmail and Outlook drop SVG).
- `/upload` stores photos and logos in Postgres (`signature_images`), resized to 300 px and re-encoded as JPEG/PNG, max 200 KB each, deduplicated by hash. Limits are in `src/lib/server/limits.ts`: 10 uploads per IP per hour, 30 per day, 50 per account, and a total store cap (`IMAGE_STORE_LIMIT_MB`, default 300). Served from `/img/ID`.
- Drafts autosave in localStorage. Logged-in users can save signatures to the `signatures` collection.
- `copy-events` records which templates get copied, for popularity stats in the admin.
