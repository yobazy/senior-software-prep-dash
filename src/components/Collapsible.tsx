import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  defaultOpen?: boolean
  /** Tighter header and body padding for nested / list rows */
  density?: 'default' | 'compact'
  children: ReactNode
}

export function Collapsible({
  title,
  defaultOpen = false,
  density = 'default',
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const compact = density === 'compact'
  return (
    <div
      className={
        compact
          ? 'overflow-hidden rounded-lg border border-teal-100/70 bg-teal-50/25 dark:border-teal-800/45 dark:bg-zinc-950/35'
          : 'overflow-hidden rounded-xl border border-teal-100 bg-teal-50/40 dark:border-teal-800/60 dark:bg-zinc-950/50'
      }
    >
      <button
        type="button"
        className={
          compact
            ? 'flex w-full cursor-pointer items-center justify-between gap-2 px-2 py-1.5 text-left text-xs font-semibold text-teal-900 transition-colors duration-200 hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 dark:text-teal-100 dark:hover:bg-teal-950/30 dark:focus-visible:outline-teal-400'
            : 'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-teal-900 transition-colors duration-200 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 dark:text-teal-100 dark:hover:bg-teal-950/40 dark:focus-visible:outline-teal-400'
        }
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <span
          className={
            compact
              ? 'tabular-nums text-teal-600 text-[0.7rem] dark:text-teal-400'
              : 'tabular-nums text-teal-600 dark:text-teal-400'
          }
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          className={
            compact
              ? 'border-t border-teal-100/80 px-2 py-1.5 text-xs text-teal-900/90 dark:border-teal-800/55 dark:text-teal-200/90'
              : 'border-t border-teal-100 px-3 py-2 text-sm text-teal-900/90 dark:border-teal-800/70 dark:text-teal-200/90'
          }
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
