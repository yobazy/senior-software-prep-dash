import type { PracticeEvent, SessionEntry } from '../types'
import { calendarDayKey, calendarDayKeyFromIso } from './dateKeys'

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(key: string, delta: number): string {
  const d = parseDateKey(key)
  d.setDate(d.getDate() + delta)
  return calendarDayKey(d)
}

/** Consecutive calendar days with at least one practice event or legacy manual session. */
export function computeDayStreak(
  practiceEvents: PracticeEvent[],
  legacySessionLog: SessionEntry[],
): number {
  const days = new Set<string>()
  for (const e of practiceEvents) {
    const k = calendarDayKeyFromIso(e.at)
    if (k) days.add(k)
  }
  for (const e of legacySessionLog) {
    const k = calendarDayKeyFromIso(e.createdAt)
    if (k) days.add(k)
  }
  if (days.size === 0) return 0
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
