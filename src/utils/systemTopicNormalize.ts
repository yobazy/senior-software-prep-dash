import type {
  SystemAttempt,
  SystemAttemptKind,
  SystemStatus,
  SystemTopic,
  SystemTopicKind,
  SystemTopicTier,
} from '../types'
import { hasPressureTestedAttempt } from './systemAttempts'

const SYSTEM_STATUSES = new Set<SystemStatus>([
  'not_started',
  'studied',
  'confident',
])

const ATTEMPT_KINDS = new Set<SystemAttemptKind>(['solo', 'solo_timed', 'mock'])

function parseLastDay(v: unknown): string | null {
  if (v === null) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return null
}

function parseTier(v: unknown): SystemTopicTier | undefined {
  if (v === 1 || v === 2 || v === 3) return v
  return undefined
}

function parseTopicKind(v: unknown): SystemTopicKind | undefined {
  if (v === 'practice' || v === 'case_study') return v
  return undefined
}

function normalizeAttempt(p: unknown): SystemAttempt | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>
  if (typeof o.kind !== 'string' || !ATTEMPT_KINDS.has(o.kind as SystemAttemptKind)) {
    return null
  }
  const day = parseLastDay(o.day)
  if (!day) return null
  const at =
    typeof o.at === 'string' && o.at.trim() ? o.at : `${day}T12:00:00.000Z`
  const id = typeof o.id === 'string' ? o.id : crypto.randomUUID()
  return { id, at, kind: o.kind as SystemAttemptKind, day }
}

/**
 * Merge catalog seeds into existing topics by title.
 * Syncs tier/kind from catalog; preserves user progress fields.
 */
export function mergeSystemTopicCatalog(
  existing: SystemTopic[],
  catalog: SystemTopic[],
): SystemTopic[] {
  const byTitle = new Map(
    existing.map((t) => [t.title.trim().toLowerCase(), t] as const),
  )
  const out = existing.map((t) => {
    const seed = catalog.find(
      (s) => s.title.trim().toLowerCase() === t.title.trim().toLowerCase(),
    )
    if (!seed) return t
    return {
      ...t,
      ...(seed.tier !== undefined ? { tier: seed.tier } : {}),
      ...(seed.kind !== undefined ? { kind: seed.kind } : {}),
      // Seed notes only fill empty notes (e.g. new case-study copy).
      ...(seed.notes && !t.notes.trim() ? { notes: seed.notes } : {}),
    }
  })
  for (const seed of catalog) {
    const key = seed.title.trim().toLowerCase()
    if (byTitle.has(key)) continue
    byTitle.set(key, seed)
    out.push(seed)
  }
  return out
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

  const attempts = Array.isArray(o.attempts)
    ? o.attempts.map(normalizeAttempt).filter((a): a is SystemAttempt => a !== null)
    : []

  const practiceCount =
    attempts.length > 0
      ? attempts.length
      : typeof o.practiceCount === 'number' && o.practiceCount >= 0
        ? Math.floor(o.practiceCount)
        : 0

  const lastFromAttempts =
    attempts.length > 0
      ? attempts.reduce((best, a) => (a.day > best ? a.day : best), attempts[0].day)
      : null

  const tier = parseTier(o.tier)
  const kind = parseTopicKind(o.kind)

  const topic: SystemTopic = {
    id,
    title,
    status,
    notes,
    practiceCount,
    lastPracticedDay: lastFromAttempts ?? parseLastDay(o.lastPracticedDay),
    ...(tier !== undefined ? { tier } : {}),
    ...(kind !== undefined ? { kind } : {}),
    ...(attempts.length > 0 ? { attempts } : {}),
  }

  // Honest readiness: Confident without a pressure-tested attempt → Studied.
  if (topic.status === 'confident' && attempts.length > 0 && !hasPressureTestedAttempt(topic)) {
    topic.status = 'studied'
  }

  return topic
}

export function tierSortKey(t: SystemTopic): number {
  return t.tier ?? 99
}
