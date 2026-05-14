import type { SessionEntry } from '../types'

function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(key: string, delta: number): string {
  const d = parseDateKey(key)
  d.setDate(d.getDate() + delta)
  return dateKey(d)
}

/** Consecutive calendar days with at least one log, counting backward from the most recent active day. */
export function computeDayStreak(logs: SessionEntry[]): number {
  if (logs.length === 0) return 0
  const days = new Set(
    logs.map((e) => dateKey(new Date(e.createdAt))),
  )
  const sorted = [...days].sort()
  const end = sorted[sorted.length - 1]
  if (!end) return 0
  let streak = 0
  let cursor = end
  while (days.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}
