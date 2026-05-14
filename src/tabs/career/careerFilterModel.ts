import type { CareerApplication } from '../../careerOps/parseApplications'

export type ScoreTierFilter = 'any' | 'ge35' | 'ge40' | 'has_score' | 'no_score'
export type PdfFilter = 'any' | 'yes' | 'no'

export type PipelineStats = {
  total: number
  applied: number
  evaluated: number
  scoreGe35: number
  scoreGe40: number
}

function normStatus(s: string): string {
  return s.trim().toLowerCase()
}

export function computePipelineStats(rows: CareerApplication[]): PipelineStats {
  let applied = 0
  let evaluated = 0
  let scoreGe35 = 0
  let scoreGe40 = 0
  for (const r of rows) {
    const n = normStatus(r.status)
    if (n === 'applied') applied += 1
    if (n === 'evaluated') evaluated += 1
    if (r.score != null && r.score >= 3.5) scoreGe35 += 1
    if (r.score != null && r.score >= 4.0) scoreGe40 += 1
  }
  return {
    total: rows.length,
    applied,
    evaluated,
    scoreGe35,
    scoreGe40,
  }
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((s) => s.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  )
}

/** First exact status string from data matching normalized label (e.g. `evaluated`). */
export function findStatusLabel(
  rows: CareerApplication[],
  normalized: string,
): string | undefined {
  const want = normalized.trim().toLowerCase()
  for (const r of rows) {
    if (r.status.trim().toLowerCase() === want) return r.status
  }
  return undefined
}

function matchesSearch(r: CareerApplication, q: string): boolean {
  if (!q) return true
  const hay = [
    r.company,
    r.role,
    r.status,
    r.notes,
    String(r.number),
    r.scoreRaw,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

function matchesScoreTier(r: CareerApplication, tier: ScoreTierFilter): boolean {
  switch (tier) {
    case 'any':
      return true
    case 'ge35':
      return r.score != null && r.score >= 3.5
    case 'ge40':
      return r.score != null && r.score >= 4.0
    case 'has_score':
      return r.score != null
    case 'no_score':
      return r.score == null
    default:
      return true
  }
}

function matchesPdf(r: CareerApplication, pdf: PdfFilter): boolean {
  if (pdf === 'any') return true
  if (pdf === 'yes') return r.hasPdf
  return !r.hasPdf
}

export function filterApplications(
  rows: CareerApplication[],
  opts: {
    search: string
    statusWhitelist: string[] | null
    company: string
    scoreTier: ScoreTierFilter
    pdf: PdfFilter
  },
): CareerApplication[] {
  const q = opts.search.trim().toLowerCase()
  return rows.filter((r) => {
    if (!matchesSearch(r, q)) return false
    if (opts.company && r.company !== opts.company) return false
    if (opts.statusWhitelist && opts.statusWhitelist.length > 0) {
      if (!opts.statusWhitelist.includes(r.status)) return false
    }
    if (!matchesScoreTier(r, opts.scoreTier)) return false
    if (!matchesPdf(r, opts.pdf)) return false
    return true
  })
}
