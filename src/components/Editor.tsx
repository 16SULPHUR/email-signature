'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { CustomFieldsEditor } from '@/components/CustomFieldsEditor'
import { ExtrasEditor } from '@/components/ExtrasEditor'
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

export function Editor({ template }: { template: Template }) {
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

  const flash = (msg: string) => {
    setStatus(msg)
    clearTimeout(statusTimer.current)
    statusTimer.current = setTimeout(() => setStatus(''), 2500)
  }

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
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
      setData({
        fields: draft.fields,
        socials: draft.socials,
        customFields: draft.customFields || [],
        extras: draft.extras,
        style: draft.styles?.[template.id] || {},
      })
    }
    setReady(true)
  }, [savedId, template.id])

  useEffect(() => {
    if (ready && !savedId) saveDraft(template.id, data)
  }, [data, ready, savedId, template.id])

  const touched = useRef(false)
  useEffect(() => {
    if (!ready) return
    if (!touched.current) {
      touched.current = true
      return
    }
    const t = setTimeout(() => api.collect(template.id, data), 2000)
    return () => clearTimeout(t)
  }, [data, ready, template.id])

  const [settled, setSettled] = useState(data)
  useEffect(() => {
    if (!template.animation) return
    const t = setTimeout(() => setSettled(data), 700)
    return () => clearTimeout(t)
  }, [data, template.animation])
  const shown = template.animation ? settled : data
  const previewHtml = useMemo(() => renderSignature(template, shown, ''), [template, shown])
  const exportHtml = () => renderSignature(template, data, siteUrl())
  const style = resolveStyle(template, data)

  const setField = (key: FieldKey, value: string) =>
    setData((d) => ({ ...d, fields: { ...d.fields, [key]: value } }))

  const onCopy = async () => {
    await copyRich(exportHtml())
    api.trackCopy(template.id, 'rich')
    api.collect(template.id, data, true)
    flash('Signature copied. Paste it into your email settings.')
  }
  const onCopyHtml = async () => {
    await copyText(exportHtml())
    api.trackCopy(template.id, 'html')
    api.collect(template.id, data, true)
    flash('HTML source copied')
  }
  const onDownload = () => {
    downloadHtml(exportHtml(), `${template.id}-signature.html`)
    api.trackCopy(template.id, 'download')
    api.collect(template.id, data, true)
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
    setData({ fields: {}, socials: [], customFields: [], extras: {}, style: {} })
  }

  return (
    <div className="editor">
      <div className="editor__form">
        <div className="editor__head">
          <Link href="/templates" className="back">
            ← Templates
          </Link>
        </div>

        {FIELD_GROUPS.map((g) => {
          const keys = template.fields.filter((k) => FIELDS[k]?.group === g.id)
          if (g.id === 'extras') return null
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
                <p className="hint">Upload an image or paste a link.</p>
              )}
            </fieldset>
          )
        })}

        <fieldset className="panel">
          <legend>Social links</legend>
          <SocialsEditor socials={data.socials} onChange={(socials) => setData((d) => ({ ...d, socials }))} />
        </fieldset>

        <fieldset className="panel">
          <legend>Button & extras</legend>
          <ExtrasEditor
            data={data}
            onField={setField}
            onExtras={(patch) => setData((d) => ({ ...d, extras: { ...d.extras, ...patch } }))}
            onError={flash}
          />
        </fieldset>

        <fieldset className="panel">
          <legend>Custom fields</legend>
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
            <button type="button" className="btn" onClick={onSave}>
              {savedId ? 'Update saved' : 'Save to account'}
            </button>
          ) : user === null ? (
            <p className="hint">
              <Link href="/signup">Sign up</Link> to save signatures.
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
