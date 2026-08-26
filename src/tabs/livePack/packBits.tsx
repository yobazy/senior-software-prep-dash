import type { ReactNode } from 'react'
import type { DraftStatus, TodoStatus } from '../../livePack/types'

export function DraftBadge({ status }: { status?: DraftStatus }) {
  const s = status ?? 'empty'
  const cls =
    s === 'drafted'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100'
      : s === 'outlined'
        ? 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
        : s === 'probing'
          ? 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100'
          : 'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'
  const label =
    s === 'drafted'
      ? 'Drafted'
      : s === 'outlined'
        ? 'Outlined'
        : s === 'probing'
          ? 'Probing'
          : 'Empty'
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  )
}

export function TodoBadge({ status }: { status: TodoStatus }) {
  const cls =
    status === 'done'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100'
      : status === 'doing'
        ? 'border-orange-300 bg-orange-50 text-orange-950 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100'
        : 'border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100'
  const label = status === 'done' ? 'Done' : status === 'doing' ? 'Doing' : 'Open'
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  )
}

export function Spoken({ text }: { text: string }) {
  const trimmed = text.trim()
  if (!trimmed) {
    return (
      <p className="text-sm text-teal-800/80 dark:text-teal-300/85">
        No spoken draft in the file yet.
      </p>
    )
  }
  return <blockquote className="pack-spoken">{trimmed}</blockquote>
}

export function Prose({ text }: { text: string }) {
  const trimmed = text.trim()
  if (!trimmed) return null
  const blocks = trimmed.split(/\n{2,}/)
  return (
    <div className="space-y-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
      {blocks.map((block, i) => {
        if (block.startsWith('>')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-teal-300 pl-3 text-teal-800 dark:border-teal-700 dark:text-teal-200"
            >
              {inlineMd(block.replace(/^>\s?/gm, ''))}
            </blockquote>
          )
        }
        if (/^[-*]\s/m.test(block)) {
          const items = block.split('\n').filter((l) => /^[-*]\s/.test(l))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {items.map((item, j) => (
                <li key={j}>{inlineMd(item.replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{inlineMd(block)}</p>
      })}
    </div>
  )
}

function inlineMd(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-teal-100 px-1 py-0.5 text-[0.8em] dark:bg-teal-950/70"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={i}>{part}</span>
  })
}