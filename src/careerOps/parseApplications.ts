/**
 * Parses career-ops `applications.md` tracker table.
 * Mirrors dashboard/internal/data/career.go ParseApplications (table rows only).
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

export function parseApplicationsMarkdown(content: string): CareerApplication[] {
  const lines = content.split('\n')
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
    const n0 = parseInt(fields[0]!, 10)
    if (!Number.isNaN(n0)) trackerNumber = n0

    const scoreRaw = fields[4] ?? ''
    let score: number | null = null
    const sm = reScoreValue.exec(scoreRaw)
    if (sm) score = parseFloat(sm[1]!)

    const pdfCol = fields[6] ?? ''
    const hasPdf = pdfCol.includes('\u2705')

    let reportNumber: string | null = null
    let reportPath: string | null = null
    const reportCol = fields[7] ?? ''
    const rm = reReportLink.exec(reportCol)
    if (rm) {
      reportNumber = rm[1]!
      reportPath = rm[2]!
    }

    let notes = ''
    if (fields.length > 8) notes = fields[8] ?? ''

    apps.push({
      number: trackerNumber,
      date: fields[1] ?? '',
      company: fields[2] ?? '',
      role: fields[3] ?? '',
      scoreRaw,
      score,
      status: fields[5] ?? '',
      hasPdf,
      reportNumber,
      reportPath,
      notes,
    })
  }

  return apps
}
