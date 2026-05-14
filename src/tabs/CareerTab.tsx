import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type { CareerApplication } from '../careerOps/parseApplications'
import {
  IconArrowsUpDown,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from './career/CareerIcons'
import {
  type PdfFilter,
  type ScoreTierFilter,
  computePipelineStats,
  filterApplications,
  findStatusLabel,
  uniqueSorted,
} from './career/careerFilterModel'

type ApiSuccess = {
  applications: CareerApplication[]
  generatedAt: string
  careerOpsPath: string
  applicationsFile: string
}

type ApiErrorBody = { error: string }

type SortColumn =
  | 'number'
  | 'date'
  | 'company'
  | 'role'
  | 'score'
  | 'status'
  | 'pdf'
  | 'report'

type SortDirection = 'asc' | 'desc'

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function statusTone(status: string): string {
  const s = status.toUpperCase()
  if (s.includes('SKIP') || s.includes('DISCARD')) {
    return 'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200'
  }
  if (s.includes('INTERVIEW') || s.includes('OFFER')) {
    return 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-100'
  }
  if (s.includes('APPLIED') || s.includes('EVALUATED')) {
    return 'border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100'
  }
  return 'border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200'
}

function compareIsoDate(a: string, b: string): number {
  const ta = Date.parse(a)
  const tb = Date.parse(b)
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
  if (Number.isNaN(ta)) return 1
  if (Number.isNaN(tb)) return -1
  return ta - tb
}

function reportSortKey(r: CareerApplication): string {
  return (r.reportAbsolutePath ?? r.reportPath ?? '').toLowerCase()
}

/** Default when switching to this column (first click). */
function defaultSortDirection(col: SortColumn): SortDirection {
  if (
    col === 'company' ||
    col === 'role' ||
    col === 'status' ||
    col === 'report'
  ) {
    return 'asc'
  }
  return 'desc'
}

function compareRows(
  a: CareerApplication,
  b: CareerApplication,
  column: SortColumn,
  dir: SortDirection,
): number {
  const asc = dir === 'asc'
  let c: number

  switch (column) {
    case 'number':
      c = a.number - b.number
      break
    case 'date':
      c = compareIsoDate(a.date, b.date)
      break
    case 'company':
      c = a.company.localeCompare(b.company, undefined, { sensitivity: 'base' })
      break
    case 'role':
      c = a.role.localeCompare(b.role, undefined, { sensitivity: 'base' })
      break
    case 'status':
      c = a.status.localeCompare(b.status, undefined, { sensitivity: 'base' })
      break
    case 'pdf': {
      const va = a.hasPdf ? 1 : 0
      const vb = b.hasPdf ? 1 : 0
      c = va - vb
      break
    }
    case 'report':
      c = reportSortKey(a).localeCompare(reportSortKey(b), undefined, {
        sensitivity: 'base',
      })
      break
    case 'score': {
      const na = a.score
      const nb = b.score
      if (na == null && nb == null) return 0
      if (na == null) return 1
      if (nb == null) return -1
      if (asc) return na - nb
      return nb - na
    }
    default:
      return 0
  }

  return asc ? c : -c
}

type SortState = { column: SortColumn; direction: SortDirection }

function sortReducer(state: SortState, column: SortColumn): SortState {
  if (state.column === column) {
    return {
      column,
      direction: state.direction === 'asc' ? 'desc' : 'asc',
    }
  }
  return {
    column,
    direction: defaultSortDirection(column),
  }
}

function SortableTh({
  column,
  label,
  activeColumn,
  direction,
  onSort,
  className = '',
}: {
  column: SortColumn
  label: string
  activeColumn: SortColumn
  direction: SortDirection
  onSort: (col: SortColumn) => void
  className?: string
}) {
  const active = activeColumn === column
  return (
    <th
      scope="col"
      className={`px-3 py-2 ${className}`}
      aria-sort={
        active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined
      }
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="group inline-flex w-full min-w-0 cursor-pointer items-center gap-1 rounded-md text-left font-semibold text-teal-950 transition-colors duration-200 hover:bg-teal-100/80 hover:text-teal-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/50 motion-reduce:transition-none dark:text-teal-50 dark:hover:bg-teal-900/40 dark:hover:text-teal-50 dark:focus-visible:outline-teal-400/40"
      >
        <span className="min-w-0">{label}</span>
        <span
          className={`shrink-0 text-teal-600 opacity-0 transition-opacity duration-200 motion-reduce:transition-none group-hover:opacity-100 dark:text-teal-400 ${active ? 'opacity-100' : ''}`}
          aria-hidden
        >
          {active ? (
            direction === 'asc' ? (
              <IconChevronUp className="h-3.5 w-3.5" />
            ) : (
              <IconChevronDown className="h-3.5 w-3.5" />
            )
          ) : (
            <IconArrowsUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </th>
  )
}

const SCORE_TIER_OPTIONS: { id: ScoreTierFilter; label: string }[] = [
  { id: 'any', label: 'Any score' },
  { id: 'ge35', label: '≥ 3.5' },
  { id: 'ge40', label: '≥ 4.0' },
  { id: 'has_score', label: 'Has score' },
  { id: 'no_score', label: 'N/A only' },
]

const PDF_OPTIONS: { id: PdfFilter; label: string }[] = [
  { id: 'any', label: 'Any' },
  { id: 'yes', label: 'With PDF' },
  { id: 'no', label: 'No PDF' },
]

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/60 dark:focus-visible:outline-teal-400/50 ${
        pressed
          ? 'border-teal-600 bg-teal-600 text-white shadow-sm dark:border-teal-500 dark:bg-teal-500 dark:text-teal-950'
          : 'border-teal-200 bg-white text-teal-900 hover:border-teal-400 hover:bg-teal-50 dark:border-teal-800 dark:bg-zinc-900 dark:text-teal-100 dark:hover:border-teal-600 dark:hover:bg-teal-950/60'
      }`}
    >
      {children}
    </button>
  )
}

function StatCard({
  label,
  value,
  hint,
  onClick,
  title,
}: {
  label: string
  value: number
  hint?: string
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="app-card cursor-pointer text-left transition-[box-shadow,border-color,background-color] duration-200 motion-reduce:transition-none hover:border-teal-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500/50 dark:hover:border-teal-700"
    >
      <p className="app-section-label">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-teal-950 dark:text-teal-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs leading-snug text-teal-800/80 dark:text-teal-300/80">
          {hint}
        </p>
      ) : null}
    </button>
  )
}

export function CareerTab() {
  const [rows, setRows] = useState<CareerApplication[]>([])
  const [meta, setMeta] = useState<{
    generatedAt: string
    careerOpsPath: string
    applicationsFile: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [companyFilter, setCompanyFilter] = useState('')
  const [scoreTier, setScoreTier] = useState<ScoreTierFilter>('any')
  const [pdfFilter, setPdfFilter] = useState<PdfFilter>('any')
  const [sort, dispatchSort] = useReducer(sortReducer, {
    column: 'number' as SortColumn,
    direction: 'desc' as SortDirection,
  })

  const clearFilters = useCallback(() => {
    setFilterText('')
    setSelectedStatuses([])
    setCompanyFilter('')
    setScoreTier('any')
    setPdfFilter('any')
  }, [])

  const pipelineStats = useMemo(() => computePipelineStats(rows), [rows])

  const statusOptions = useMemo(
    () => uniqueSorted(rows.map((r) => r.status)),
    [rows],
  )
  const companyOptions = useMemo(
    () => uniqueSorted(rows.map((r) => r.company)),
    [rows],
  )

  const hasActiveFilters =
    filterText.trim() !== '' ||
    selectedStatuses.length > 0 ||
    companyFilter !== '' ||
    scoreTier !== 'any' ||
    pdfFilter !== 'any'

  const filteredSorted = useMemo(() => {
    const statusWhitelist =
      selectedStatuses.length > 0 ? selectedStatuses : null
    const list = filterApplications(rows, {
      search: filterText,
      statusWhitelist,
      company: companyFilter,
      scoreTier,
      pdf: pdfFilter,
    })
    const copy = [...list]
    copy.sort((a, b) => compareRows(a, b, sort.column, sort.direction))
    return copy
  }, [
    rows,
    filterText,
    selectedStatuses,
    companyFilter,
    scoreTier,
    pdfFilter,
    sort.column,
    sort.direction,
  ])

  const toggleStatusChip = useCallback((status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }, [])

  const applyEvaluatedOnly = useCallback(() => {
    const label = findStatusLabel(rows, 'evaluated')
    setSelectedStatuses(label ? [label] : [])
    setScoreTier('any')
  }, [rows])

  const applyAppliedOnly = useCallback(() => {
    const label = findStatusLabel(rows, 'applied')
    setSelectedStatuses(label ? [label] : [])
    setScoreTier('any')
  }, [rows])

  const applyScoreGe35 = useCallback(() => {
    setSelectedStatuses([])
    setScoreTier('ge35')
  }, [])

  const applyScoreGe40 = useCallback(() => {
    setSelectedStatuses([])
    setScoreTier('ge40')
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/career-ops/applications')
      const text = await res.text()
      const json = parseJsonSafe(text)
      if (!json || typeof json !== 'object') {
        setRows([])
        setMeta(null)
        setError(
          res.ok
            ? 'Unexpected response from server.'
            : 'Career pipeline API is only available when you run `npm run dev` with CAREER_OPS_PATH set (see .env.example).',
        )
        return
      }
      if (!res.ok) {
        const err = json as ApiErrorBody
        setRows([])
        setMeta(null)
        setError(typeof err.error === 'string' ? err.error : `Request failed (${res.status})`)
        return
      }
      const ok = json as ApiSuccess
      if (!Array.isArray(ok.applications)) {
        setError('Invalid API response shape.')
        setRows([])
        setMeta(null)
        return
      }
      setRows(ok.applications)
      setMeta({
        generatedAt: ok.generatedAt,
        careerOpsPath: ok.careerOpsPath,
        applicationsFile: ok.applicationsFile,
      })
    } catch (e) {
      setRows([])
      setMeta(null)
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load()
    })
  }, [load])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="app-page-heading">Career pipeline</h1>
          <p className="app-page-desc">
            Live view of{' '}
            <code className="rounded bg-teal-100/80 px-1 py-0.5 text-xs dark:bg-teal-900/50">
              applications.md
            </code>{' '}
            from career-ops (dev server only).
          </p>
        </div>
        <button
          type="button"
          className="app-btn-primary self-start sm:self-auto"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div
          className="rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {error}
        </div>
      )}

      {meta && !error && (
        <p className="text-xs text-teal-800/75 dark:text-teal-300/75">
          Source:{' '}
          <span className="font-mono break-all">{meta.applicationsFile}</span>
          <br />
          Loaded {new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'medium',
          }).format(new Date(meta.generatedAt))}
        </p>
      )}

      {rows.length > 0 && !error && (
        <section
          aria-label="Pipeline summary"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            label="Total roles"
            value={pipelineStats.total}
            hint="All tracker rows"
            title="Clear filters and show the full list"
            onClick={clearFilters}
          />
          <StatCard
            label="Applied"
            value={pipelineStats.applied}
            hint="Status is “Applied”"
            title="Filter to Applied status only"
            onClick={() => {
              clearFilters()
              applyAppliedOnly()
            }}
          />
          <StatCard
            label="Evaluated"
            value={pipelineStats.evaluated}
            hint="Status is “Evaluated”"
            title="Filter to Evaluated status only"
            onClick={() => {
              clearFilters()
              applyEvaluatedOnly()
            }}
          />
          <StatCard
            label="Score ≥ 3.5"
            value={pipelineStats.scoreGe35}
            hint="Numeric score 3.5 or higher"
            title="Filter to rows scored at least 3.5"
            onClick={() => {
              clearFilters()
              applyScoreGe35()
            }}
          />
          <StatCard
            label="Score ≥ 4.0"
            value={pipelineStats.scoreGe40}
            hint="Numeric score 4.0 or higher"
            title="Filter to rows scored at least 4.0"
            onClick={() => {
              clearFilters()
              applyScoreGe40()
            }}
          />
        </section>
      )}

      <section className="app-card space-y-6" aria-labelledby="career-filters-heading">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-teal-100 pb-4 dark:border-teal-900/50">
          <div>
            <h2
              id="career-filters-heading"
              className="text-sm font-semibold text-teal-950 dark:text-teal-50"
            >
              Filters
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-teal-800/85 dark:text-teal-300/85">
              Combine search, status, score band, PDF, and company. Sort the grid
              by clicking any column title.
            </p>
          </div>
          <button
            type="button"
            className="app-btn-secondary cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear all
          </button>
        </div>

        {rows.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold uppercase tracking-wider text-teal-700/85 dark:text-teal-400/90">
              Quick
            </span>
            <button
              type="button"
              className="app-btn-secondary cursor-pointer text-xs"
              onClick={() => {
                clearFilters()
                applyEvaluatedOnly()
              }}
            >
              Evaluated only
            </button>
            <button
              type="button"
              className="app-btn-secondary cursor-pointer text-xs"
              onClick={() => {
                clearFilters()
                applyAppliedOnly()
              }}
            >
              Applied only
            </button>
            <button
              type="button"
              className="app-btn-secondary cursor-pointer text-xs"
              onClick={() => {
                clearFilters()
                applyScoreGe35()
              }}
            >
              Strong (≥ 3.5)
            </button>
            <button
              type="button"
              className="app-btn-secondary cursor-pointer text-xs"
              onClick={() => {
                clearFilters()
                applyScoreGe40()
              }}
            >
              Top tier (≥ 4.0)
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <label htmlFor="career-filter" className="app-section-label">
              Search
            </label>
            <input
              id="career-filter"
              type="search"
              className="app-field mt-1 w-full max-w-xl"
              placeholder="Company, role, status, notes, #, score text…"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="lg:col-span-12">
            <p className="app-section-label">Status</p>
            <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-300/80">
              {selectedStatuses.length === 0
                ? 'No chips selected — all statuses are included.'
                : 'Showing rows that match any selected status.'}
            </p>
            <div
              className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-xl border border-teal-100 bg-teal-50/40 p-3 dark:border-teal-900/45 dark:bg-teal-950/30"
              role="group"
              aria-label="Filter by status"
            >
              {statusOptions.length === 0 ? (
                <span className="text-xs text-teal-700 dark:text-teal-400">
                  Load data to see status values.
                </span>
              ) : (
                statusOptions.map((st) => (
                  <FilterChip
                    key={st}
                    pressed={selectedStatuses.includes(st)}
                    onClick={() => toggleStatusChip(st)}
                  >
                    {st}
                  </FilterChip>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="career-company" className="app-section-label">
              Company
            </label>
            <select
              id="career-company"
              className="app-field mt-1 w-full"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">All companies</option>
              {companyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4">
            <p id="career-score-tier" className="app-section-label">
              Score band
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-labelledby="career-score-tier"
            >
              {SCORE_TIER_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.id}
                  pressed={scoreTier === opt.id}
                  onClick={() =>
                    setScoreTier((prev) => (prev === opt.id ? 'any' : opt.id))
                  }
                >
                  {opt.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <p id="career-pdf-filter" className="app-section-label">
              PDF
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-labelledby="career-pdf-filter"
            >
              {PDF_OPTIONS.map((opt) => (
                <FilterChip
                  key={opt.id}
                  pressed={pdfFilter === opt.id}
                  onClick={() =>
                    setPdfFilter((prev) => (prev === opt.id ? 'any' : opt.id))
                  }
                >
                  {opt.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-teal-800/80 dark:text-teal-200/80">
          Showing <strong>{filteredSorted.length}</strong> of {rows.length} rows
          {hasActiveFilters ? (
            <span className="text-teal-700 dark:text-teal-300"> (filtered)</span>
          ) : null}
        </p>

        <div className="overflow-x-auto rounded-xl border border-teal-100 dark:border-teal-900/50">
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/80 dark:border-teal-900/50 dark:bg-teal-950/50">
                <SortableTh
                  column="number"
                  label="#"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                  className="tabular-nums"
                />
                <SortableTh
                  column="date"
                  label="Date"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                />
                <SortableTh
                  column="company"
                  label="Company"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                />
                <SortableTh
                  column="role"
                  label="Role"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                />
                <SortableTh
                  column="score"
                  label="Score"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                  className="tabular-nums"
                />
                <SortableTh
                  column="status"
                  label="Status"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                />
                <SortableTh
                  column="pdf"
                  label="PDF"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                  className="text-center [&_button]:justify-center"
                />
                <SortableTh
                  column="report"
                  label="Report path"
                  activeColumn={sort.column}
                  direction={sort.direction}
                  onSort={dispatchSort}
                />
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-teal-700 dark:text-teal-300">
                    Loading applications…
                  </td>
                </tr>
              ) : filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-teal-700 dark:text-teal-300">
                    No rows match these filters.
                  </td>
                </tr>
              ) : (
                filteredSorted.map((r) => (
                  <tr
                    key={`${r.number}-${r.date}-${r.company}-${r.role}`}
                    className="border-b border-teal-50 align-top last:border-0 dark:border-teal-900/35"
                  >
                    <td className="px-3 py-2 tabular-nums text-teal-900 dark:text-teal-100">
                      {r.number}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-teal-800 dark:text-teal-200">
                      {r.date}
                    </td>
                    <td className="px-3 py-2 font-medium text-teal-950 dark:text-teal-50">
                      {r.company}
                    </td>
                    <td className="max-w-[14rem] px-3 py-2 text-teal-900 dark:text-teal-100">
                      <span className="line-clamp-2" title={r.role}>
                        {r.role}
                      </span>
                      {r.notes ? (
                        <span
                          className="mt-1 block text-xs leading-snug text-teal-700/90 dark:text-teal-300/85"
                          title={r.notes}
                        >
                          {r.notes}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums text-teal-900 dark:text-teal-100">
                      {r.scoreRaw || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${statusTone(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center text-teal-700 dark:text-teal-300">
                        {r.hasPdf ? (
                          <>
                            <IconCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="sr-only">PDF generated</span>
                          </>
                        ) : (
                          <>
                            <IconX className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                            <span className="sr-only">No PDF</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {r.reportAbsolutePath ? (
                        <div className="flex max-w-[18rem] flex-col gap-1">
                          <code className="block break-all rounded bg-teal-100/70 px-1.5 py-1 text-[11px] leading-snug text-teal-950 dark:bg-teal-950/60 dark:text-teal-100">
                            {r.reportAbsolutePath}
                          </code>
                          <button
                            type="button"
                            className="app-btn-secondary w-fit cursor-pointer text-[11px]"
                            onClick={() =>
                              void navigator.clipboard.writeText(r.reportAbsolutePath ?? '')
                            }
                          >
                            Copy path
                          </button>
                        </div>
                      ) : r.reportPath ? (
                        <code className="text-[11px] text-teal-800 dark:text-teal-300">
                          {r.reportPath}
                        </code>
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
