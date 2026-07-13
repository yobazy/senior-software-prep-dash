import type { SystemAttempt, SystemAttemptKind, SystemTopic } from '../types'

const PRESSURE_KINDS = new Set<SystemAttemptKind>(['solo_timed', 'mock'])

export function labelSystemAttemptKind(kind: SystemAttemptKind): string {
  if (kind === 'solo') return 'Solo'
  if (kind === 'solo_timed') return 'Solo timed'
  return 'Mock'
}

export function topicAttempts(topic: SystemTopic): SystemAttempt[] {
  return topic.attempts ?? []
}

/** Confident requires at least one timed talk-through or live mock. */
export function hasPressureTestedAttempt(topic: SystemTopic): boolean {
  return topicAttempts(topic).some((a) => PRESSURE_KINDS.has(a.kind))
}

export function attemptKindCounts(topic: SystemTopic): Record<SystemAttemptKind, number> {
  const counts: Record<SystemAttemptKind, number> = {
    solo: 0,
    solo_timed: 0,
    mock: 0,
  }
  for (const a of topicAttempts(topic)) {
    counts[a.kind] += 1
  }
  return counts
}

/** Most recent mock day across all topics, or null if none. */
export function latestMockDay(topics: SystemTopic[]): string | null {
  let best: string | null = null
  for (const t of topics) {
    for (const a of topicAttempts(t)) {
      if (a.kind !== 'mock') continue
      if (!best || a.day > best) best = a.day
    }
  }
  return best
}

/** Whole local calendar days from `fromDay` to `toDay` (toDay − fromDay). */
export function daysBetweenLocalDays(fromDay: string, toDay: string): number {
  const [fy, fm, fd] = fromDay.split('-').map(Number)
  const [ty, tm, td] = toDay.split('-').map(Number)
  const from = Date.UTC(fy, fm - 1, fd)
  const to = Date.UTC(ty, tm - 1, td)
  return Math.round((to - from) / 86_400_000)
}
