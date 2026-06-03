import type { AppData, CodingConfidence, CodingProblem, PracticeEvent } from '../types'
import { parseCodingConfidence } from './codingProblemNormalize'

export const STORAGE_BACKUP_KEY = 'interview-prep-v1-backup'

const CONFIDENCE_RANK: Record<CodingConfidence, number> = {
  not_practiced: 0,
  needs_work: 1,
  almost_there: 2,
  confident: 3,
}

export function codingProgressScore(raw: string | null): number {
  if (!raw) return 0
  try {
    const d = JSON.parse(raw) as {
      codingProblems?: unknown[]
      practiceEvents?: PracticeEvent[]
    }
    let score = 0
    if (Array.isArray(d.codingProblems)) {
      for (const item of d.codingProblems) {
        if (!item || typeof item !== 'object') continue
        const o = item as Record<string, unknown>
        if (typeof o.practiceCount === 'number' && o.practiceCount > 0) {
          score += 2
        }
        const c = o.confidence ?? o.status
        if (
          c === 'needs_work' ||
          c === 'almost_there' ||
          c === 'confident' ||
          c === 'attempted' ||
          c === 'solved'
        ) {
          score += 1
        }
      }
    }
    if (Array.isArray(d.practiceEvents)) {
      score += d.practiceEvents.filter((e) => e.track === 'coding').length
    }
    return score
  } catch {
    return 0
  }
}

function parseConfidenceFromEventDetail(
  detail: string | undefined,
): CodingConfidence | null {
  if (!detail) return null
  const parts = detail.split('→').map((s) => s.trim().toLowerCase())
  const after = parts[parts.length - 1]
  if (after.includes('confident')) return 'confident'
  if (after.includes('almost there')) return 'almost_there'
  if (after.includes('needs work')) return 'needs_work'
  if (after.includes('not practiced')) return 'not_practiced'
  return null
}

/** Rebuild LC # → best known confidence from coding practice events. */
export function confidenceByLcFromEvents(
  events: PracticeEvent[],
  problems: CodingProblem[],
): Map<number, CodingConfidence> {
  const titleToLc = new Map(
    problems.map((p) => [p.title.trim().toLowerCase(), p.lcNumber]),
  )
  const byLc = new Map<number, CodingConfidence>()

  for (const e of events) {
    if (e.track !== 'coding') continue
    const fromDetail = parseConfidenceFromEventDetail(e.detail)
    const lc =
      titleToLc.get(e.label.trim().toLowerCase()) ??
      problems.find((p) => p.id === e.label)?.lcNumber
    if (lc === undefined) continue
    const next = fromDetail ?? 'needs_work'
    const prev = byLc.get(lc) ?? 'not_practiced'
    if (CONFIDENCE_RANK[next] >= CONFIDENCE_RANK[prev]) {
      byLc.set(lc, next)
    }
  }

  return byLc
}

/** Overlay saved progress from a raw snapshot onto the current catalog list. */
export function overlayCodingProgress(
  catalog: CodingProblem[],
  rawProblems: unknown[],
  events: PracticeEvent[],
): CodingProblem[] {
  const byLc = new Map<number, CodingProblem>()

  for (const item of rawProblems) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const lc =
      typeof o.lcNumber === 'number' && Number.isFinite(o.lcNumber)
        ? o.lcNumber
        : NaN
    if (!Number.isFinite(lc)) continue

    const confidence = parseCodingConfidence(o)
    const practiceCount =
      typeof o.practiceCount === 'number' && o.practiceCount >= 0
        ? Math.floor(o.practiceCount)
        : 0
    const lastPracticedDay =
      o.lastPracticedDay === null ||
      (typeof o.lastPracticedDay === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(o.lastPracticedDay))
        ? (o.lastPracticedDay as string | null)
        : null
    const notes = typeof o.notes === 'string' ? o.notes : ''

    const prev = byLc.get(lc)
    const keep =
      !prev ||
      CONFIDENCE_RANK[confidence] > CONFIDENCE_RANK[prev.confidence] ||
      practiceCount > prev.practiceCount

    if (keep) {
      const seed = catalog.find((c) => c.lcNumber === lc)
      const base = prev ?? seed
      if (!base) continue
      byLc.set(lc, {
        ...base,
        confidence,
        practiceCount,
        lastPracticedDay,
        notes: notes || prev?.notes || '',
      })
    }
  }

  for (const [lc, confidence] of confidenceByLcFromEvents(events, catalog)) {
    const prev = byLc.get(lc)
    if (!prev || CONFIDENCE_RANK[confidence] > CONFIDENCE_RANK[prev.confidence]) {
      const seed = catalog.find((c) => c.lcNumber === lc)
      if (seed) byLc.set(lc, { ...seed, ...prev, confidence })
    }
  }

  return catalog.map((seed) => {
    const saved = byLc.get(seed.lcNumber)
    if (!saved) return seed
    return {
      ...seed,
      confidence: saved.confidence,
      practiceCount: Math.max(saved.practiceCount, seed.practiceCount),
      lastPracticedDay: saved.lastPracticedDay ?? seed.lastPracticedDay,
      notes: saved.notes || seed.notes,
    }
  })
}

export type StorageSnapshotInfo = {
  key: string
  progressScore: number
  practicedCount: number
  eventCount: number
}

export function listRecoverySnapshots(): StorageSnapshotInfo[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.includes('interview-prep') || k.includes('interview_prep'))) {
      keys.push(k)
    }
  }
  return keys.map((key) => {
    const raw = localStorage.getItem(key)
    let practicedCount = 0
    let eventCount = 0
    try {
      const d = JSON.parse(raw ?? '') as {
        codingProblems?: { confidence?: string; practiceCount?: number }[]
        practiceEvents?: PracticeEvent[]
      }
      if (Array.isArray(d.codingProblems)) {
        practicedCount = d.codingProblems.filter(
          (p) =>
            p.confidence &&
            p.confidence !== 'not_practiced' &&
            (p.practiceCount ?? 0) > 0,
        ).length
      }
      if (Array.isArray(d.practiceEvents)) {
        eventCount = d.practiceEvents.filter((e) => e.track === 'coding').length
      }
    } catch {
      /* ignore */
    }
    return {
      key,
      progressScore: codingProgressScore(raw),
      practicedCount,
      eventCount,
    }
  })
}

export function parseStorageSnapshot(raw: string): Partial<AppData> | null {
  try {
    const p = JSON.parse(raw) as Partial<AppData>
    return p && typeof p === 'object' ? p : null
  } catch {
    return null
  }
}
