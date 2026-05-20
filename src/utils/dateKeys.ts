/** Local calendar day `YYYY-MM-DD` (not UTC) for streaks and practice summaries. */
export function calendarDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function calendarDayKeyFromIso(iso: string): string {
  try {
    return calendarDayKey(new Date(iso))
  } catch {
    return ''
  }
}
