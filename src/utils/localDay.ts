/** Local calendar day as YYYY-MM-DD (for streaks / "last practiced"). */
export function localDayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Human-readable label for a YYYY-MM-DD key, or "Never" when null. */
export function formatPracticeDay(dayKey: string | null): string {
  if (!dayKey) return 'Never'
  try {
    const [y, m, d] = dayKey.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  } catch {
    return dayKey
  }
}
