'use client'

import { useState } from 'react'

const GUIDES: { id: string; label: string; steps: string[] }[] = [
  {
    id: 'gmail',
    label: 'Gmail',
    steps: [
      'Click Copy signature above.',
      'In Gmail, open Settings (gear icon) → See all settings → General.',
      'Scroll to Signature, click Create new and give it a name.',
      'Paste into the editor box (Ctrl/Cmd + V).',
      'Under Signature defaults, pick it for new emails and replies, then click Save Changes at the bottom.',
    ],
  },
  {
    id: 'outlook-web',
    label: 'Outlook web / new Outlook',
    steps: [
      'Click Copy signature above.',
      'Open Settings (gear icon) → Accounts → Signatures.',
      'Click New signature, name it, and paste into the box.',
      'Choose it as the default for new messages and replies, then Save.',
    ],
  },
  {
    id: 'outlook-win',
    label: 'Outlook for Windows',
    steps: [
      'Click Copy signature above.',
      'Open File → Options → Mail → Signatures.',
      'Click New, name it, then paste into the Edit signature box.',
      'Set it as the default for new messages and replies, then click OK.',
      'Tip: if images look broken, click Download instead and insert the file from Signatures → Edit → Insert.',
    ],
  },
  {
    id: 'outlook-mac',
    label: 'Outlook for Mac',
    steps: [
      'Click Copy signature above.',
      'Open Outlook → Settings → Signatures.',
      'Click + to add a signature, name it and paste into the editor.',
      'Close the editor, then choose the default signature for your account.',
    ],
  },
  {
    id: 'apple',
    label: 'Apple Mail',
    steps: [
      'Click Copy signature above.',
      'Open Mail → Settings → Signatures, select your account and click +.',
      'Uncheck “Always match my default message font”.',
      'Paste into the right-hand box. Images may show as blue question marks there: they appear correctly once you send.',
      'Choose the signature in the Choose Signature menu.',
    ],
  },
  {
    id: 'yahoo',
    label: 'Yahoo Mail',
    steps: [
      'Click Copy signature above.',
      'Open Settings → More Settings → Writing email.',
      'Turn on Signature for your address and paste into the box. Changes save automatically.',
    ],
  },
  {
    id: 'thunderbird',
    label: 'Thunderbird',
    steps: [
      'Click Download above to save the signature as an .html file.',
      'Open Account Settings for your address.',
      'Check “Attach the signature from a file instead” and choose the downloaded file.',
    ],
  },
]

export function InstallGuide() {
  const [tab, setTab] = useState('gmail')
  const guide = GUIDES.find((g) => g.id === tab)!
  return (
    <section className="guide">
      <h2>Add it to your email</h2>
      <div className="chips chips--sm" role="tablist">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={tab === g.id}
            className={`chip${tab === g.id ? ' chip--on' : ''}`}
            onClick={() => setTab(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <ol>
        {guide.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  )
}
