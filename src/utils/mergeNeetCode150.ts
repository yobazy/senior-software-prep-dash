import type { CodingProblem } from '../types'

export function neetCodeCatalogId(lcNumber: number): string {
  return `neetcode150-${lcNumber}`
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
      user ?? { ...seed, id: seed.id || neetCodeCatalogId(seed.lcNumber) },
    )
  }

  for (const p of existing) {
    if (!seen.has(p.lcNumber)) merged.push(p)
  }

  return merged
}
