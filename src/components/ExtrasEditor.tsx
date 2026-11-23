'use client'

import { useState } from 'react'

import { HandwritingPad } from '@/components/HandwritingPad'
import { api } from '@/lib/client/api'
import { DISCLAIMER_PRESETS, MEETING_PROVIDERS } from '@/lib/signature/extras'
import type { FieldKey, SignatureData } from '@/lib/signature/types'

type Props = {
  data: SignatureData
  onField: (key: FieldKey, value: string) => void
  onExtras: (patch: NonNullable<SignatureData['extras']>) => void
  onError: (msg: string) => void
}

const providerOf = (url: string) => MEETING_PROVIDERS.find((p) => url.toLowerCase().startsWith(p.base))

export function ExtrasEditor({ data, onField, onExtras, onError }: Props) {
  const [busy, setBusy] = useState(false)
  const f = data.fields
  const ctaUrl = f.ctaUrl || ''
  const provider = providerOf(ctaUrl)
  const extras = data.extras || {}

  const pickProvider = (id: string) => {
    const p = MEETING_PROVIDERS.find((x) => x.id === id)
    onField('ctaUrl', p ? p.base : '')
    if (p && !f.ctaText) onField('ctaText', 'Book a meeting')
  }

  const uploadBanner = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      onExtras({ bannerUrl: await api.uploadImage(file, 'banner') })
    } catch (e) {
      onError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fields">
      <div className="field field--wide">
        <label>Handwritten signature</label>
        <HandwritingPad
          name={f.name || ''}
          value={extras.handwritingUrl || ''}
          onChange={(handwritingUrl) => onExtras({ handwritingUrl })}
          onError={onError}
        />
      </div>

      <div className="field field--wide">
        <label htmlFor="f-signoff">Sign-off</label>
        <input
          id="f-signoff"
          className="input"
          placeholder="Best regards,"
          value={f.signoff || ''}
          onChange={(e) => onField('signoff', e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="f-ctaText">Button text</label>
        <input
          id="f-ctaText"
          className="input"
          placeholder="Book a meeting"
          value={f.ctaText || ''}
          onChange={(e) => onField('ctaText', e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="f-cta-kind">Button links to</label>
        <select
          id="f-cta-kind"
          className="input"
          value={provider?.id || 'custom'}
          onChange={(e) => pickProvider(e.target.value)}
        >
          <option value="custom">Any link</option>
          {MEETING_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} booking page
            </option>
          ))}
        </select>
      </div>
      <div className="field field--wide">
        <label htmlFor="f-ctaUrl">{provider ? `${provider.label} username and event` : 'Button link'}</label>
        {provider ? (
          <span className="field__row">
            <span className="field__prefix">{provider.base}</span>
            <input
              id="f-ctaUrl"
              className="input"
              placeholder="yourname/30min"
              value={ctaUrl.slice(provider.base.length)}
              onChange={(e) => onField('ctaUrl', provider.base + e.target.value.replace(/^\/+/, ''))}
            />
          </span>
        ) : (
          <input
            id="f-ctaUrl"
            className="input"
            inputMode="url"
            placeholder="https://calendar.google.com/…"
            value={ctaUrl}
            onChange={(e) => onField('ctaUrl', e.target.value)}
          />
        )}
      </div>

      <div className="field field--wide">
        <label htmlFor="f-disclaimer">Disclaimer</label>
        <select
          className="input"
          aria-label="Disclaimer preset"
          value=""
          onChange={(e) => {
            const p = DISCLAIMER_PRESETS.find((x) => x.id === e.target.value)
            if (p) onField('disclaimer', p.text)
          }}
        >
          <option value="">Use a preset…</option>
          {DISCLAIMER_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <textarea
          id="f-disclaimer"
          className="input"
          rows={3}
          value={f.disclaimer || ''}
          onChange={(e) => onField('disclaimer', e.target.value)}
        />
      </div>

      <div className="field field--wide">
        <label htmlFor="f-banner">Banner (under the signature)</label>
        <span className="field__row">
          <input
            id="f-banner"
            className="input"
            inputMode="url"
            placeholder="Upload, or paste an image link"
            value={extras.bannerUrl || ''}
            onChange={(e) => onExtras({ bannerUrl: e.target.value })}
          />
          <span className="btn btn--sm upload">
            {busy ? '…' : 'Upload'}
            <input type="file" accept="image/*" onChange={(e) => uploadBanner(e.target.files?.[0])} />
          </span>
        </span>
        {extras.bannerUrl && (
          <input
            className="input"
            inputMode="url"
            aria-label="Banner link"
            placeholder="Where the banner links to"
            value={extras.bannerLink || ''}
            onChange={(e) => onExtras({ bannerLink: e.target.value })}
          />
        )}
      </div>

      <div className="field field--wide">
        <label className="check">
          <input type="checkbox" checked={!!extras.utm} onChange={(e) => onExtras({ utm: e.target.checked })} />
          Add UTM tags to my website and button links
        </label>
        {extras.utm && (
          <input
            className="input"
            aria-label="Campaign name"
            placeholder="Campaign name (default: signature)"
            value={extras.utmCampaign || ''}
            onChange={(e) => onExtras({ utmCampaign: e.target.value })}
          />
        )}
      </div>
    </div>
  )
}
