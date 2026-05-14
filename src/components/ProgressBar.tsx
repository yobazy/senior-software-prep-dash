type Tone = 'story' | 'coding' | 'system'

const barBg: Record<Tone, string> = {
  story: 'bg-teal-500 dark:bg-teal-400',
  coding: 'bg-orange-500 dark:bg-orange-400',
  system: 'bg-teal-700 dark:bg-teal-500',
}

type Props = {
  label: string
  value: number
  tone: Tone
}

export function ProgressBar({ label, value, tone }: Props) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-teal-950 dark:text-teal-50">
          {label}
        </span>
        <span className="text-sm tabular-nums text-teal-700/80 dark:text-teal-300/90">
          {clamped}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-teal-100 dark:bg-teal-950/80">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${barBg[tone]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} readiness ${clamped}%`}
        />
      </div>
    </div>
  )
}
