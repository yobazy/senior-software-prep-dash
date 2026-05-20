import type { PracticeEvent, SessionEntry } from '../types'
import { calendarDayKeyFromIso } from './dateKeys'

const MAX_DAYS_SHOWN = 21

export type DayPracticeGroup = {
  dayKey: string
  events: PracticeEvent[]
  legacyNotes: SessionEntry[]
}

/** Newest days first; each day lists events newest-first within the day. */
export function buildPracticeDayGroups(
  practiceEvents: PracticeEvent[],
  legacySessionLog: SessionEntry[],
): DayPracticeGroup[] {
  const byDay = new Map<string, { events: PracticeEvent[]; legacy: SessionEntry[] }>()

  for (const e of practiceEvents) {
    const day = calendarDayKeyFromIso(e.at)
    if (!day) continue
    const row = byDay.get(day) ?? { events: [], legacy: [] }
    row.events.push(e)
    byDay.set(day, row)
  }
  for (const e of legacySessionLog) {
    const day = calendarDayKeyFromIso(e.createdAt)
    if (!day) continue
    const row = byDay.get(day) ?? { events: [], legacy: [] }
    row.legacy.push(e)
    byDay.set(day, row)
  }

  for (const [, row] of byDay) {
    row.events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
    row.legacy.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    )
  }

  const sortedKeys = [...byDay.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
  const keys = sortedKeys.slice(0, MAX_DAYS_SHOWN)
  return keys.map((dayKey) => {
    const row = byDay.get(dayKey)!
    return { dayKey, events: row.events, legacyNotes: row.legacy }
  })
}
