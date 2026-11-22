import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dir = path.join(root, 'templates')
const out = path.join(root, 'src/generated/templates.json')

const REQUIRED = ['id', 'name', 'category', 'width', 'theme']

function listSlugs() {
  const indexFile = path.join(dir, 'index.json')
  if (fs.existsSync(indexFile)) {
    const raw = JSON.parse(fs.readFileSync(indexFile, 'utf8'))
    const list = Array.isArray(raw) ? raw : raw.templates || []
    return list.map((t) => (typeof t === 'string' ? t : t.slug || t.id))
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

const STYLE_KEYS = ['iconSize', 'avatarSize', 'iconStyle']

function normalize(meta, slug, html) {
  const theme = { ...meta.theme }
  const defaults = { ...meta.defaults }
  for (const k of STYLE_KEYS) {
    if (theme[k] !== undefined) {
      defaults[k] ??= theme[k]
      delete theme[k]
    }
  }
  let preview = meta.preview
  if (preview && !preview.fields) {
    const { socials, ...fields } = preview
    preview = { fields, socials }
  }
  return { tags: [], description: '', fields: [], ...meta, id: meta.id || slug, theme, defaults, preview, html }
}

const errors = []
const templates = []

for (const slug of listSlugs()) {
  const metaPath = path.join(dir, slug, 'meta.json')
  const htmlPath = path.join(dir, slug, 'template.html')
  if (!fs.existsSync(metaPath) || !fs.existsSync(htmlPath)) {
    errors.push(`${slug}: missing meta.json or template.html`)
    continue
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  const missing = REQUIRED.filter((k) => meta[k] === undefined)
  if (missing.length) {
    errors.push(`${slug}: meta.json missing ${missing.join(', ')}`)
    continue
  }
  const html = fs.readFileSync(htmlPath, 'utf8')
  if (/{{{|{{&/.test(html)) errors.push(`${slug}: unescaped Mustache tags are not allowed`)
  if (/<style|<script/i.test(html)) errors.push(`${slug}: <style> and <script> are not email safe`)
  templates.push(normalize(meta, slug, html))
}

if (errors.length) {
  console.error('Template errors:\n' + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(templates))
console.log(`Built ${templates.length} templates`)
