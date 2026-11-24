'use client'

import { useEffect, useRef } from 'react'

const BUTTONS: { cmd: string; label: string; title: string; style?: React.CSSProperties }[] = [
  { cmd: 'bold', label: 'B', title: 'Bold', style: { fontWeight: 700 } },
  { cmd: 'italic', label: 'I', title: 'Italic', style: { fontStyle: 'italic' } },
  { cmd: 'underline', label: 'U', title: 'Underline', style: { textDecoration: 'underline' } },
  {
    cmd: 'strikeThrough',
    label: 'S',
    title: 'Strikethrough',
    style: { textDecoration: 'line-through' },
  },
  { cmd: 'insertUnorderedList', label: '• List', title: 'Bulleted list' },
  { cmd: 'insertOrderedList', label: '1. List', title: 'Numbered list' },
  { cmd: 'formatBlock:blockquote', label: '” Quote', title: 'Quote' },
  { cmd: 'removeFormat', label: 'Tx', title: 'Clear formatting' },
]

type Props = {
  id: string
  value: string
  onChange: (html: string) => void
  resetKey: number
}

export function RichEditor({ id, value, onChange, resetKey }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = ''
  }, [resetKey])

  const emit = () => {
    const el = ref.current
    if (!el) return
    const empty = !el.textContent?.trim() && !el.querySelector('li')
    onChange(empty ? '' : el.innerHTML)
  }

  const run = (cmd: string) => {
    ref.current?.focus()
    const [name, arg] = cmd.split(':')
    document.execCommand(name, false, arg)
    emit()
  }

  const link = () => {
    ref.current?.focus()
    const url = window.prompt('Link address (https://…)')
    if (url && /^(https?:\/\/|mailto:)/i.test(url.trim()))
      document.execCommand('createLink', false, url.trim())
    emit()
  }

  return (
    <div className="editor">
      <div className="editor__bar" role="toolbar" aria-label="Formatting">
        {BUTTONS.map((b) => (
          <button
            key={b.cmd}
            type="button"
            className="editor__btn"
            title={b.title}
            aria-label={b.title}
            style={b.style}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run(b.cmd)}
          >
            {b.label}
          </button>
        ))}
        <button
          type="button"
          className="editor__btn"
          title="Insert link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={link}
        >
          Link
        </button>
        <button
          type="button"
          className="editor__btn"
          title="Undo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run('undo')}
        >
          ↶
        </button>
        <button
          type="button"
          className="editor__btn"
          title="Redo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => run('redo')}
        >
          ↷
        </button>
      </div>
      <div
        id={id}
        ref={ref}
        className="editor__area input"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-empty={value ? undefined : 'true'}
        data-placeholder="Write your message"
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          e.preventDefault()
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'))
        }}
      />
    </div>
  )
}
