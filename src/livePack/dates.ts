export function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate)
  if (!m) return null
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

export function countdownLabel(isoDate: string | null): string | null {
  const d = daysUntil(isoDate)
  if (d == null) return null
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  if (d === -1) return 'Yesterday'
  if (d > 1) return `In ${d} days`
  return `${Math.abs(d)} days ago`
}
