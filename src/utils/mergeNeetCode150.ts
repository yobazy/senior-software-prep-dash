import type { CodingProblem } from '../types'

export function neetCodeCatalogId(lcNumber: number): string {
  return `neetcode150-${lcNumber}`
}

function mergeUserOntoSeed(
  seed: CodingProblem,
  user: CodingProblem,
): CodingProblem {
  return {
    ...seed,
    ...user,
    id: user.id || seed.id || neetCodeCatalogId(seed.lcNumber),
    pattern: user.pattern.trim() ? user.pattern : seed.pattern,
    title: user.title.trim() ? user.title : seed.title,
    difficulty: user.difficulty ?? seed.difficulty,
    lcSlug: user.lcSlug ?? seed.lcSlug,
    confidence: user.confidence,
    practiceCount: user.practiceCount,
    lastPracticedDay: user.lastPracticedDay,
    notes: user.notes,
  }
}

/** Merge saved problems with the NeetCode 150 catalog; keep user progress by LC #. */
export function mergeNeetCode150(
  existing: CodingProblem[],
  catalog: CodingProblem[],
): CodingProblem[] {
  const byLc = new Map(existing.map((p) => [p.lcNumber, p]))
  const merged: CodingProblem[] = []
  const seen = new Set<number>()

  for (const seed of catalog) {
    seen.add(seed.lcNumber)
    const user = byLc.get(seed.lcNumber)
    merged.push(
      user
        ? mergeUserOntoSeed(seed, user)
        : { ...seed, id: seed.id || neetCodeCatalogId(seed.lcNumber) },
    )
  }

  for (const p of existing) {
    if (!seen.has(p.lcNumber)) {
      const seed = catalog.find((c) => c.lcNumber === p.lcNumber)
      merged.push(seed ? mergeUserOntoSeed(seed, p) : p)
    }
  }

  return merged
}
