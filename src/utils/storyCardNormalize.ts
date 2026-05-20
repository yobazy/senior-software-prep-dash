import type { StoryCard, StoryStatus } from '../types'

const STORY_STATUSES = new Set<StoryStatus>([
  'not_practiced',
  'needs_work',
  'confident',
])

function parseLastDay(v: unknown): string | null {
  if (v === null) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return null
}

export function normalizeStoryCards(
  raw: unknown,
  fallback: StoryCard[],
): StoryCard[] {
  if (!Array.isArray(raw)) return fallback
  const out: StoryCard[] = []
  for (const item of raw) {
    const n = normalizeOne(item)
    if (n) out.push(n)
  }
  return out
}

function normalizeOne(p: unknown): StoryCard | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>

  const title = typeof o.title === 'string' ? o.title : ''
  const context = typeof o.context === 'string' ? o.context : ''
  const star = typeof o.star === 'string' ? o.star : ''
  const notes = typeof o.notes === 'string' ? o.notes : ''
  if (!title.trim()) return null

  const id = typeof o.id === 'string' ? o.id : crypto.randomUUID()

  let status: StoryStatus = 'not_practiced'
  if (typeof o.status === 'string' && STORY_STATUSES.has(o.status as StoryStatus)) {
    status = o.status as StoryStatus
  }

  let practiceCount = 0
  if (
    typeof o.practiceCount === 'number' &&
    Number.isFinite(o.practiceCount) &&
    o.practiceCount >= 0
  ) {
    practiceCount = Math.floor(o.practiceCount)
  }

  const lastPracticedDay = parseLastDay(o.lastPracticedDay)

  return {
    id,
    title,
    context,
    star,
    status,
    notes,
    practiceCount,
    lastPracticedDay,
  }
}
