import type { SystemStatus, SystemTopic, SystemTopicTier } from '../types'

const SYSTEM_STATUSES = new Set<SystemStatus>([
  'not_started',
  'studied',
  'confident',
])

function parseLastDay(v: unknown): string | null {
  if (v === null) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return null
}

function parseTier(v: unknown): SystemTopicTier | undefined {
  if (v === 1 || v === 2 || v === 3) return v
  return undefined
}

export function normalizeSystemTopics(
  raw: unknown,
  fallback: SystemTopic[],
): SystemTopic[] {
  if (!Array.isArray(raw)) return fallback
  const out: SystemTopic[] = []
  for (const item of raw) {
    const n = normalizeOne(item)
    if (n) out.push(n)
  }
  return out
}

function normalizeOne(p: unknown): SystemTopic | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>

  const title = typeof o.title === 'string' ? o.title : ''
  if (!title.trim()) return null

  const id = typeof o.id === 'string' ? o.id : crypto.randomUUID()
  const notes = typeof o.notes === 'string' ? o.notes : ''

  let status: SystemStatus = 'not_started'
  if (typeof o.status === 'string' && SYSTEM_STATUSES.has(o.status as SystemStatus)) {
    status = o.status as SystemStatus
  }

  const practiceCount =
    typeof o.practiceCount === 'number' && o.practiceCount >= 0
      ? Math.floor(o.practiceCount)
      : 0

  const tier = parseTier(o.tier)

  return {
    id,
    title,
    status,
    notes,
    practiceCount,
    lastPracticedDay: parseLastDay(o.lastPracticedDay),
    ...(tier !== undefined ? { tier } : {}),
  }
}

export function tierSortKey(t: SystemTopic): number {
  return t.tier ?? 99
}
