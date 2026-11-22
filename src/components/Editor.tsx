'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CustomFieldsEditor } from '@/components/CustomFieldsEditor'
import { InstallGuide } from '@/components/InstallGuide'
import { SignatureFrame } from '@/components/SignatureFrame'
import { SocialsEditor } from '@/components/SocialsEditor'
import { StyleEditor } from '@/components/StyleEditor'
import { api, useSession } from '@/lib/client/api'
import { copyRich, copyText, downloadHtml } from '@/lib/client/copy'
import { clearDraft, loadDraft, saveDraft } from '@/lib/client/draft'
import { siteUrl } from '@/lib/site'
import { FIELD_GROUPS, FIELDS } from '@/lib/signature/fields'
import { previewData } from '@/lib/signature/preview'
import { renderSignature, resolveStyle } from '@/lib/signature/render'
import type { FieldKey, SignatureData, Template } from '@/lib/signature/types'

type Props = { template: Template; templates: Pick<Template, 'id' | 'name'>[] }

export function Editor({ template, templates }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const savedId = params.get('sig')
  const user = useSession()

  const [data, setData] = useState<SignatureData>(() => previewData(template))
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState('')
  const [dark, setDark] = useState(false)
  const [sigName, setSigName] = useState('')
  const statusTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (savedId) {
      api
        .getSignature(savedId)
        .then((s) => {
          setData(s.data)
          setSigName(s.name)
        })
        .catch(() => flash('Could not load that saved signature'))
        .finally(() => setReady(true))
      return
    }
    const draft = loadDraft()
    if (draft)
      setData({
        fields: draft.fields,
        socials: draft.socials,
        customFields: draft.customFields || [],
        style: draft.styles?.[template.id] || {},
      })
    setReady(true)
  }, [savedId, template.id])

  useEffect(() => {
    if (ready && !savedId) saveDraft(template.id, data)
  }, [data, ready, savedId, template.id])

  const flash = (msg: string) => {
    setStatus(msg)
    clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setStatus(''), 2500)
  }

  const previewHtml = useMemo(() => renderSignature(template, data, ''), [template, data])
  const exportHtml = () => renderSignature(template, data, siteUrl())
  const style = resolveStyle(template, data)

  const setField = (key: FieldKey, value: string) =>
    setData((d) => ({ ...d, fields: { ...d.fields, [key]: value } }))

  const used = new Set(template.fields)
  const unusedFilled = Object.entries(data.fields).filter(([k, v]) => v && !used.has(k as FieldKey)).length

  const onCopy = async () => {
    await copyRich(exportHtml())
    api.trackCopy(template.id, 'rich')
    flash('Signature copied. Paste it into your email settings.')
  }
  const onCopyHtml = async () => {
    await copyText(exportHtml())
    api.trackCopy(template.id, 'html')
    flash('HTML source copied')
  }
  const onDownload = () => {
    downloadHtml(exportHtml(), `${template.id}-signature.html`)
    api.trackCopy(template.id, 'download')
  }

  const onSave = async () => {
    const name = sigName || `${data.fields.name || 'My'} · ${template.name}`
    try {
      const { doc } = await api.saveSignature({ name, template: template.id, data }, savedId || undefined)
      setSigName(doc.name)
      if (!savedId) router.replace(`/templates/${template.id}?sig=${doc.id}`, { scroll: false })
      flash('Saved to your account')
    } catch (e) {
      flash((e as Error).message)
    }
  }

  const onClearSample = () => {
    clearDraft()
    setData({ fields: {}, socials: [], customFields: [], style: {} })
  }

  const switchTemplate = (id: string) => {
    if (!savedId) saveDraft(template.id, data)
    router.push(`/templates/${id}${savedId ? `?sig=${savedId}` : ''}`)
  }

  return (
    <div className="editor">
      <div className="editor__form">
        <div className="editor__head">
          <Link href="/#templates" className="back">
            ← All templates
          </Link>
          <label className="field field--inline">
            <span>Template</span>
            <select className="input" value={template.id} onChange={(e) => switchTemplate(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {FIELD_GROUPS.map((g) => {
          const keys = template.fields.filter((k) => FIELDS[k]?.group === g.id)
          if (!keys.length) return null
          return (
            <fieldset key={g.id} className="panel">
              <legend>{g.label}</legend>
              <div className="fields">
                {keys.map((k) => (
                  <FieldInput
                    key={k}
                    k={k}
                    value={data.fields[k] || ''}
                    onChange={(v) => setField(k, v)}
                    canUpload={k === 'photoUrl' || k === 'logoUrl'}
                    onUploadError={flash}
                  />
                ))}
              </div>
              {g.id === 'media' && (
                <p className="hint">Upload an image and we host it for you, or paste a public image link.</p>
              )}
            </fieldset>
          )
        })}

        <fieldset className="panel">
          <legend>Social links</legend>
          <SocialsEditor socials={data.socials} onChange={(socials) => setData((d) => ({ ...d, socials }))} />
        </fieldset>

        <fieldset className="panel">
          <legend>Custom fields</legend>
          <p className="hint">Add anything else: office hours, languages, a booking link. Shown under your signature.</p>
          <CustomFieldsEditor
            items={data.customFields || []}
            onChange={(customFields) => setData((d) => ({ ...d, customFields }))}
          />
        </fieldset>

        <fieldset className="panel">
          <legend>Style</legend>
          <StyleEditor
            template={template}
            style={style}
            onChange={(patch) => setData((d) => ({ ...d, style: { ...d.style, ...patch } }))}
            onReset={() => setData((d) => ({ ...d, style: {} }))}
          />
        </fieldset>

        <div className="editor__foot">
          <button type="button" className="btn btn--text" onClick={onClearSample}>
            Clear all fields
          </button>
          {unusedFilled > 0 && (
            <span className="hint">
              {unusedFilled} filled field{unusedFilled > 1 ? 's are' : ' is'} kept for other templates.
            </span>
          )}
        </div>
      </div>

      <aside className="editor__preview">
        <div className="preview">
          <div className="preview__bar">
            <span className="preview__dots">
              <i />
              <i />
              <i />
            </span>
            <span>New message</span>
            <button type="button" className="btn btn--text btn--sm" onClick={() => setDark((v) => !v)}>
              {dark ? 'Light inbox' : 'Dark inbox'}
            </button>
          </div>
          <div className="preview__body">
            <p className="preview__line">Hi there,</p>
            <p className="preview__line">Thanks for your time today. Talk soon!</p>
            <SignatureFrame html={previewHtml} dark={dark} />
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn btn--primary" onClick={onCopy}>
            Copy signature
          </button>
          <button type="button" className="btn" onClick={onCopyHtml}>
            Copy HTML
          </button>
          <button type="button" className="btn" onClick={onDownload}>
            Download
          </button>
        </div>

        <div className="save">
          {user ? (
            <>
              <input
                className="input"
                placeholder="Name this signature"
                value={sigName}
                onChange={(e) => setSigName(e.target.value)}
              />
              <button type="button" className="btn" onClick={onSave}>
                {savedId ? 'Update saved' : 'Save to account'}
              </button>
            </>
          ) : user === null ? (
            <p className="hint">
              Your details autosave in this browser. <Link href="/signup">Sign up</Link> to keep signatures across
              devices.
            </p>
          ) : null}
        </div>

        <p className="status" role="status" aria-live="polite">
          {status}
        </p>

        <InstallGuide />
      </aside>
    </div>
  )
}

function FieldInput({
  k,
  value,
  onChange,
  canUpload,
  onUploadError,
}: {
  k: FieldKey
  value: string
  onChange: (v: string) => void
  canUpload: boolean
  onUploadError: (msg: string) => void
}) {
  const def = FIELDS[k]
  const [busy, setBusy] = useState(false)
  const id = `f-${k}`

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      onChange(await api.uploadImage(file, k === 'photoUrl' ? 'photo' : 'logo'))
    } catch (e) {
      onUploadError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`field${def.type === 'textarea' ? ' field--wide' : ''}`}>
      <label htmlFor={id}>{def.label}</label>
      {def.type === 'textarea' ? (
        <textarea
          id={id}
          className="input"
          rows={3}
          placeholder={def.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <span className="field__row">
          <input
            id={id}
            className="input"
            type={def.type === 'url' ? 'text' : def.type || 'text'}
            inputMode={def.type === 'url' ? 'url' : undefined}
            placeholder={def.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {canUpload && (
            <span className="btn btn--sm upload">
              {busy ? '…' : 'Upload'}
              <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} />
            </span>
          )}
        </span>
      )}
    </div>
  )
}
