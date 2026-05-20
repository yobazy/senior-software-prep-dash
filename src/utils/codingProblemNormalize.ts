import type { CodingProblem, Difficulty, StoryStatus } from '../types'

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

/** Accepts persisted JSON (including legacy `status` solve tracking) and returns `CodingProblem`s. */
export function normalizeCodingProblems(
  raw: unknown,
  fallback: CodingProblem[],
): CodingProblem[] {
  if (!Array.isArray(raw)) return fallback
  const out: CodingProblem[] = []
  for (const item of raw) {
    const n = normalizeOne(item)
    if (n) out.push(n)
  }
  return out
}

function normalizeOne(p: unknown): CodingProblem | null {
  if (!p || typeof p !== 'object') return null
  const o = p as Record<string, unknown>

  const title = typeof o.title === 'string' ? o.title : ''
  const pattern = typeof o.pattern === 'string' ? o.pattern : ''
  const lcNumber =
    typeof o.lcNumber === 'number' && Number.isFinite(o.lcNumber)
      ? o.lcNumber
      : NaN
  if (!title.trim() || !pattern.trim() || !Number.isFinite(lcNumber)) {
    return null
  }

  const difficulty: Difficulty =
    o.difficulty === 'Easy' ||
    o.difficulty === 'Medium' ||
    o.difficulty === 'Hard'
      ? o.difficulty
      : 'Medium'

  const id = typeof o.id === 'string' ? o.id : crypto.randomUUID()
  const notes = typeof o.notes === 'string' ? o.notes : ''
  const lcSlug = typeof o.lcSlug === 'string' ? o.lcSlug : undefined

  let confidence: StoryStatus = 'not_practiced'
  let practiceCount = 0

  if (typeof o.confidence === 'string' && STORY_STATUSES.has(o.confidence as StoryStatus)) {
    confidence = o.confidence as StoryStatus
  } else if (
    o.status === 'not_started' ||
    o.status === 'attempted' ||
    o.status === 'solved'
  ) {
    if (o.status === 'not_started') confidence = 'not_practiced'
    else if (o.status === 'attempted') {
      confidence = 'needs_work'
      practiceCount = 1
    } else {
      confidence = 'confident'
      practiceCount = 1
    }
  }

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
    pattern,
    title,
    lcNumber,
    difficulty,
    lcSlug,
    confidence,
    practiceCount,
    lastPracticedDay,
    notes,
  }
}
