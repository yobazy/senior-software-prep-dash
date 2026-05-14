import type {
  CodingStatus,
  StoryStatus,
  SystemStatus,
} from '../types'

export type StatusKind = 'story' | 'coding' | 'system'

type Props = {
  kind: StatusKind
  status: StoryStatus | CodingStatus | SystemStatus
  onClick: () => void
}

const base =
  'inline-flex cursor-pointer select-none rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none'

const styles: Record<string, string> = {
  gray: `${base} border-teal-200 bg-teal-50 text-teal-900 focus-visible:outline-teal-500 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200`,
  amber: `${base} border-amber-300 bg-amber-50 text-amber-950 focus-visible:outline-amber-500 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100`,
  green: `${base} border-emerald-300 bg-emerald-50 text-emerald-950 focus-visible:outline-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100`,
  blue: `${base} border-sky-300 bg-sky-50 text-sky-950 focus-visible:outline-sky-500 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100`,
}

function storyLabel(s: StoryStatus): string {
  if (s === 'not_practiced') return 'Not Practiced'
  if (s === 'needs_work') return 'Needs Work'
  return 'Confident'
}

function codingLabel(s: CodingStatus): string {
  if (s === 'not_started') return 'Not Started'
  if (s === 'attempted') return 'Attempted'
  return 'Solved'
}

function systemLabel(s: SystemStatus): string {
  if (s === 'not_started') return 'Not Started'
  if (s === 'studied') return 'Studied'
  return 'Confident'
}

function storyTone(s: StoryStatus): keyof typeof styles {
  if (s === 'not_practiced') return 'gray'
  if (s === 'needs_work') return 'amber'
  return 'green'
}

function codingTone(s: CodingStatus): keyof typeof styles {
  if (s === 'not_started') return 'gray'
  if (s === 'attempted') return 'amber'
  return 'green'
}

function systemTone(s: SystemStatus): keyof typeof styles {
  if (s === 'not_started') return 'gray'
  if (s === 'studied') return 'blue'
  return 'green'
}

export function StatusPill({ kind, status, onClick }: Props) {
  let label: string
  let tone: keyof typeof styles
  if (kind === 'story') {
    label = storyLabel(status as StoryStatus)
    tone = storyTone(status as StoryStatus)
  } else if (kind === 'coding') {
    label = codingLabel(status as CodingStatus)
    tone = codingTone(status as CodingStatus)
  } else {
    label = systemLabel(status as SystemStatus)
    tone = systemTone(status as SystemStatus)
  }
  return (
    <button type="button" className={styles[tone]} onClick={onClick}>
      {label}
    </button>
  )
}
