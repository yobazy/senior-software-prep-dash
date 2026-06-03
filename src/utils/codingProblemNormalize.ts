import type { CodingConfidence, CodingProblem, Difficulty } from '../types'

const CODING_CONFIDENCES = new Set<CodingConfidence>([
  'not_practiced',
  'needs_work',
  'almost_there',
  'confident',
])

function parseLastDay(v: unknown): string | null {
  if (v === null) return null
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return null
}

/** Map persisted `confidence` / `status` fields to the current confidence scale. */
export function parseCodingConfidence(o: Record<string, unknown>): CodingConfidence {
  if (
    typeof o.confidence === 'string' &&
    CODING_CONFIDENCES.has(o.confidence as CodingConfidence)
  ) {
    return o.confidence as CodingConfidence
  }

  if (typeof o.status === 'string') {
    const s = o.status
    if (CODING_CONFIDENCES.has(s as CodingConfidence)) {
      return s as CodingConfidence
    }
    if (s === 'not_started') return 'not_practiced'
    if (s === 'attempted') return 'needs_work'
    if (s === 'solved') return 'confident'
  }

  return 'not_practiced'
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

  const lcNumber =
    typeof o.lcNumber === 'number' && Number.isFinite(o.lcNumber)
      ? o.lcNumber
      : NaN
  if (!Number.isFinite(lcNumber)) return null

  const title = typeof o.title === 'string' ? o.title : ''
  const pattern = typeof o.pattern === 'string' ? o.pattern : ''

  const difficulty: Difficulty =
    o.difficulty === 'Easy' ||
    o.difficulty === 'Medium' ||
    o.difficulty === 'Hard'
      ? o.difficulty
      : 'Medium'

  const id = typeof o.id === 'string' ? o.id : crypto.randomUUID()
  const notes = typeof o.notes === 'string' ? o.notes : ''
  const lcSlug = typeof o.lcSlug === 'string' ? o.lcSlug : undefined

  const confidence = parseCodingConfidence(o)

  let practiceCount = 0
  if (
    typeof o.practiceCount === 'number' &&
    Number.isFinite(o.practiceCount) &&
    o.practiceCount >= 0
  ) {
    practiceCount = Math.floor(o.practiceCount)
  } else if (
    o.status === 'attempted' ||
    o.status === 'solved'
  ) {
    practiceCount = 1
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
