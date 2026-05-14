import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function Collapsible({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-teal-100 bg-teal-50/40 dark:border-teal-800/60 dark:bg-zinc-950/50">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-teal-900 transition-colors duration-200 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 dark:text-teal-100 dark:hover:bg-teal-950/40 dark:focus-visible:outline-teal-400"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <span
          className="tabular-nums text-teal-600 dark:text-teal-400"
          aria-hidden
        >
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div className="border-t border-teal-100 px-3 py-2 text-sm text-teal-900/90 dark:border-teal-800/70 dark:text-teal-200/90">
          {children}
        </div>
      ) : null}
    </div>
  )
}
