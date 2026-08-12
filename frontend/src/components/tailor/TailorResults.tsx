import { useState } from 'react'
import type { TailorResult } from '../../types/tailor'

// Small "Copy" label that flips to "Copied" for a moment — used next to each bullet and the
// cover letter, since the whole point of this page is pasting the output somewhere else by hand.
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-xs font-medium text-ink/50 hover:text-ink"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function TailorResults({ result }: { result: TailorResult }) {
  return (
    <div className="mt-8 space-y-6">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40">
          Suggested bullet edits
        </h2>
        <div className="mt-3 space-y-3">
          {result.bullets.map((bullet, i) => (
            <div key={i} className="rounded-[10px] border border-ink/10 p-3">
              <p className="text-xs text-ink/40 line-through">{bullet.original}</p>
              <p className="mt-1 text-sm font-medium text-ink">{bullet.suggested}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs italic text-sage">{bullet.why}</p>
                <CopyButton text={bullet.suggested} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/40">
            Cover letter draft
          </h2>
          <CopyButton text={result.cover_letter} />
        </div>
        <p className="mt-3 whitespace-pre-wrap rounded-[10px] border border-ink/10 p-3 text-sm leading-relaxed text-ink/70">
          {result.cover_letter}
        </p>
      </div>

      <p className="text-xs text-ink/40">
        Suggestions only — nothing is saved automatically. Copy what's useful into your resume.
      </p>
    </div>
  )
}
