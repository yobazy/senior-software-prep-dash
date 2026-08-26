/**
 * Parses career-ops `applications.md` tracker table.
 * Mirrors dashboard/internal/data/career.go ParseApplications (table rows only).
 *
 * Columns are mapped by header name so an inserted Via/Location column does
 * not shift Score/Status (career-ops #954).
 */

const reReportLink = /\[(\d+)\]\(([^)]+)\)/
const reScoreValue = /(\d+\.?\d*)\/5/

export interface CareerApplication {
  number: number
  date: string
  company: string
  role: string
  scoreRaw: string
  /** Parsed numeric score when present in `x.x/5` form */
  score: number | null
  status: string
  hasPdf: boolean
  reportNumber: string | null
  reportPath: string | null
  /** Set by dev server when safe to resolve under CAREER_OPS_PATH */
  reportAbsolutePath?: string | null
  notes: string
}

/** Lowercased header cell → canonical field. Mirrors career.go trackerHeaderAliases. */
const TRACKER_HEADER_ALIASES: Record<string, string> = {
  '#': 'num',
  num: 'num',
  date: 'date',
  company: 'company',
  empresa: 'company',
  via: 'via',
  role: 'role',
  puesto: 'role',
  location: 'location',
  score: 'score',
  status: 'status',
  pdf: 'pdf',
  report: 'report',
  notes: 'notes',
}

/** Original fixed layout in splitTableRow space (num=0 … notes=8). */
const LEGACY_TRACKER_COLUMNS: Record<string, number> = {
  num: 0,
  date: 1,
  company: 2,
  role: 3,
  score: 4,
  status: 5,
  pdf: 6,
  report: 7,
  notes: 8,
}

const REQUIRED_HEADER_FIELDS = ['num', 'company', 'role', 'score', 'status'] as const

function splitTableRow(line: string): string[] {
  const trimmed = line.trim()
  if (trimmed.includes('\t')) {
    let rest = trimmed
    if (rest.startsWith('|')) rest = rest.slice(1).trimStart()
    const parts = rest.split('\t')
    return parts.map((p) => p.replace(/\|/g, '').trim())
  }
  const inner = trimmed.replace(/^\|/, '').replace(/\|$/, '')
  return inner.split('|').map((p) => p.trim())
}

function detectTrackerColumns(lines: string[]): Record<string, number> | null {
  for (const raw of lines) {
    const line = raw.trim()
    if (!line.startsWith('|')) continue
    const cells = splitTableRow(line)
    const map: Record<string, number> = {}
    cells.forEach((c, i) => {
      const name = TRACKER_HEADER_ALIASES[c.toLowerCase()]
      if (name) map[name] = i
    })
    if (REQUIRED_HEADER_FIELDS.every((k) => map[k] != null)) {
      return map
    }
  }
  return null
}

function resolveTrackerColumns(lines: string[]): Record<string, number> {
  return detectTrackerColumns(lines) ?? LEGACY_TRACKER_COLUMNS
}

function cellAt(
  fields: string[],
  cols: Record<string, number>,
  name: string,
): string {
  const idx = cols[name]
  if (idx == null || idx < 0 || idx >= fields.length) return ''
  return fields[idx] ?? ''
}

export function parseApplicationsMarkdown(content: string): CareerApplication[] {
  const lines = content.split('\n')
  const cols = resolveTrackerColumns(lines)
  const apps: CareerApplication[] = []
  let rowIndex = 0

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (
      line === '' ||
      line.startsWith('# ') ||
      line.startsWith('|---') ||
      line.startsWith('| #')
    ) {
      continue
    }
    if (!line.startsWith('|')) continue

    const fields = splitTableRow(line)
    if (fields.length < 8) continue

    rowIndex += 1
    let trackerNumber = rowIndex
    const n0 = parseInt(cellAt(fields, cols, 'num'), 10)
    if (!Number.isNaN(n0)) trackerNumber = n0

    const scoreRaw = cellAt(fields, cols, 'score')
    let score: number | null = null
    const sm = reScoreValue.exec(scoreRaw)
    if (sm) score = parseFloat(sm[1]!)

    const pdfCol = cellAt(fields, cols, 'pdf')
    const hasPdf = pdfCol.includes('\u2705')

    let reportNumber: string | null = null
    let reportPath: string | null = null
    const rm = reReportLink.exec(cellAt(fields, cols, 'report'))
    if (rm) {
      reportNumber = rm[1]!
      reportPath = rm[2]!
    }

    apps.push({
      number: trackerNumber,
      date: cellAt(fields, cols, 'date'),
      company: cellAt(fields, cols, 'company'),
      role: cellAt(fields, cols, 'role'),
      scoreRaw,
      score,
      status: cellAt(fields, cols, 'status'),
      hasPdf,
      reportNumber,
      reportPath,
      notes: cellAt(fields, cols, 'notes'),
    })
  }

  return apps
}
