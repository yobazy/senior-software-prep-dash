type Tone = 'story' | 'coding' | 'system'

const barBg: Record<Tone, string> = {
  story: 'bg-track-story',
  coding: 'bg-track-coding',
  system: 'bg-track-system',
}

type Props = {
  label: string
  value: number
  tone: Tone
  detail?: string
}

export function ProgressBar({ label, value, tone, detail }: Props) {
  const clamped = Math.min(100, Math.max(0, value))
  const ariaLabel = detail
    ? `${label} readiness ${clamped}%, ${detail}`
    : `${label} readiness ${clamped}%`
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="app-metric shrink-0 text-sm text-ink-muted">
          {clamped}%
          {detail ? (
            <span className="font-normal"> · {detail}</span>
          ) : null}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-accent-soft">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none ${barBg[tone]}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  )
}
