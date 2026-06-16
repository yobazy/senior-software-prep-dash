import { useMemo, useState, type ReactNode } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { cycleCoding } from '../utils/statusCycles'
import { leetCodeProblemUrl } from '../utils/lcUrl'
import { formatPracticeDay, localDayKey } from '../utils/localDay'
import { compareTopicPatterns } from '../utils/codingTopicOrder'
import {
  codingConfidenceWeight,
  weightedReadinessPct,
} from '../utils/readinessScore'
import {
  codingProblemListId,
  suggestCodingProblems,
  type CodingSuggestion,
  type SuggestionReason,
} from '../utils/suggestCodingProblems'
import type { CodingConfidence, CodingProblem, Difficulty } from '../types'

const DIFFICULTY_OPTIONS: Difficulty[] = ['Easy', 'Medium', 'Hard']
const CONFIDENCE_OPTIONS: CodingConfidence[] = [
  'not_practiced',
  'needs_work',
  'almost_there',
  'confident',
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

function toggleFilter<T>(selected: T[], value: T): T[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value]
}

function difficultyClass(d: Difficulty): string {
  if (d === 'Easy')
    return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
  if (d === 'Medium')
    return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
  return 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
}

function difficultyRank(d: Difficulty): number {
  if (d === 'Easy') return 0
  if (d === 'Medium') return 1
  return 2
}

function confidenceLabel(s: CodingConfidence): string {
  if (s === 'not_practiced') return 'Not practiced'
  if (s === 'needs_work') return 'Needs work'
  if (s === 'almost_there') return 'Almost there'
  return 'Confident'
}

function confidenceBadgeClass(s: CodingConfidence, interactive = true): string {
  const base =
    'shrink-0 rounded-lg border px-2.5 py-0.5 text-xs font-semibold tracking-tight motion-reduce:transition-none'
  const interactiveCls = interactive
    ? ' cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
    : ''
  if (s === 'not_practiced')
    return `${base}${interactiveCls} border-teal-300/90 bg-teal-100/90 text-teal-950${interactive ? ' hover:bg-teal-200/70 focus-visible:outline-teal-600 dark:hover:bg-teal-900/70 dark:focus-visible:outline-teal-400' : ''} dark:border-teal-700 dark:bg-teal-950/80 dark:text-teal-50`
  if (s === 'needs_work')
    return `${base}${interactiveCls} border-rose-400/90 bg-rose-50 text-rose-950${interactive ? ' hover:bg-rose-100/90 focus-visible:outline-rose-500 dark:hover:bg-rose-900/45 dark:focus-visible:outline-rose-400' : ''} dark:border-rose-600 dark:bg-rose-950/55 dark:text-rose-100`
  if (s === 'almost_there')
    return `${base}${interactiveCls} border-amber-400/90 bg-amber-50 text-amber-950${interactive ? ' hover:bg-amber-100/90 focus-visible:outline-amber-500 dark:hover:bg-amber-900/45 dark:focus-visible:outline-amber-400' : ''} dark:border-amber-600 dark:bg-amber-950/55 dark:text-amber-100`
  return `${base}${interactiveCls} border-emerald-400/90 bg-emerald-50 text-emerald-950${interactive ? ' hover:bg-emerald-100/90 focus-visible:outline-emerald-600 dark:hover:bg-emerald-900/45 dark:focus-visible:outline-emerald-400' : ''} dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100`
}

function suggestionReasonLabel(reason: SuggestionReason): string {
  if (reason === 'up_next') return 'Up next'
  if (reason === 'review') return 'Review'
  return 'Up next'
}

function suggestionReasonChipClass(reason: SuggestionReason): string {
  const base =
    'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide'
  if (reason === 'review')
    return `${base} border-amber-300/90 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100`
  return `${base} border-teal-300/90 bg-teal-50 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100`
}

function scrollToProblemInList(problemId: string) {
  document
    .getElementById(codingProblemListId(problemId))
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/** Row tint + left accent so status is visible without reading the badge. */
function confidenceRowClass(s: CodingConfidence): string {
  const base =
    'border-l-[3px] px-3 py-2.5 transition-colors motion-reduce:transition-none sm:px-4'
  if (s === 'not_practiced')
    return `${base} border-l-transparent hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40`
  if (s === 'needs_work')
    return `${base} border-l-rose-500 bg-rose-50/60 hover:bg-rose-50/90 dark:border-l-rose-400 dark:bg-rose-950/30 dark:hover:bg-rose-950/45`
  if (s === 'almost_there')
    return `${base} border-l-amber-400 bg-amber-50/60 hover:bg-amber-50/90 dark:border-l-amber-500 dark:bg-amber-950/30 dark:hover:bg-amber-950/45`
  return `${base} border-l-emerald-500 bg-emerald-50/65 hover:bg-emerald-50/90 dark:border-l-emerald-400 dark:bg-emerald-950/35 dark:hover:bg-emerald-950/50`
}

function metaSep() {
  return (
    <span
      className="text-teal-300/90 select-none dark:text-teal-700"
      aria-hidden
    >
      ·
    </span>
  )
}

export function CodingTab() {
  const {
    data,
    updateCodingProblem,
    deleteCodingProblem,
    addCodingProblem,
  } = useInterviewPrep()
  const [title, setTitle] = useState('')
  const [lc, setLc] = useState('')
  const [pattern, setPattern] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [addProblemOpen, setAddProblemOpen] = useState(false)
  /** Which problem shows the notes editor (at most one). */
  const [notesEditorId, setNotesEditorId] = useState<string | null>(null)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(
    [],
  )
  const [selectedConfidences, setSelectedConfidences] = useState<
    CodingConfidence[]
  >([])

  const hasActiveFilters =
    selectedDifficulties.length > 0 || selectedConfidences.length > 0

  const filteredProblems = useMemo(() => {
    return data.codingProblems.filter((p) => {
      if (
        selectedDifficulties.length > 0 &&
        !selectedDifficulties.includes(p.difficulty)
      ) {
        return false
      }
      if (
        selectedConfidences.length > 0 &&
        !selectedConfidences.includes(p.confidence)
      ) {
        return false
      }
      return true
    })
  }, [data.codingProblems, selectedDifficulties, selectedConfidences])

  const overallPct = useMemo(() => {
    const score = data.codingProblems.reduce(
      (sum, p) => sum + codingConfidenceWeight(p.confidence),
      0,
    )
    return weightedReadinessPct(score, data.codingProblems.length)
  }, [data.codingProblems])

  const suggestions = useMemo(
    () => suggestCodingProblems(data.codingProblems, 3),
    [data.codingProblems],
  )

  const groups = useMemo(() => {
    const map = new Map<string, CodingProblem[]>()
    for (const p of filteredProblems) {
      const list = map.get(p.pattern) ?? []
      list.push(p)
      map.set(p.pattern, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const rd = difficultyRank(a.difficulty) - difficultyRank(b.difficulty)
        if (rd !== 0) return rd
        return a.lcNumber - b.lcNumber
      })
    }
    return [...map.entries()].sort(([a], [b]) => compareTopicPatterns(a, b))
  }, [filteredProblems])

  function addProblem(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(lc)
    if (!title.trim() || !pattern.trim() || !Number.isFinite(n)) return
    addCodingProblem({
      title: title.trim(),
      lcNumber: n,
      pattern: pattern.trim(),
      difficulty,
    })
    setTitle('')
    setLc('')
    setPattern('')
    setDifficulty('Medium')
  }

  function requestDeleteProblem(p: CodingProblem) {
    if (
      !window.confirm(
        `Remove “${p.title}” from your list? This cannot be undone.`,
      )
    ) {
      return
    }
    deleteCodingProblem(p.id)
    setNotesEditorId((id) => (id === p.id ? null : id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">Coding</h1>
        <p className="app-page-desc">
          <a
            href="https://neetcode.io/practice?tab=neetcode150"
            target="_blank"
            rel="noreferrer"
            className="app-link font-medium"
          >
            NeetCode 150
          </a>{' '}
          — {data.codingProblems.length} problems in roadmap order (easy → hard
          within each topic). Overall {overallPct}% ready. Tap the status badge
          to cycle confidence; log attempts and notes on each row.
        </p>
      </div>

      <SuggestedProblemsSection
        suggestions={suggestions}
        onLogAttempt={(p) =>
          updateCodingProblem(p.id, {
            practiceCount: p.practiceCount + 1,
            lastPracticedDay: localDayKey(),
          })
        }
      />

      <section className="app-card space-y-4" aria-labelledby="coding-filters-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="coding-filters-heading" className="app-section-heading">
            Filters
          </h2>
          <button
            type="button"
            className="app-btn-secondary cursor-pointer text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              setSelectedDifficulties([])
              setSelectedConfidences([])
            }}
            disabled={!hasActiveFilters}
          >
            Clear all
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="app-section-label">Difficulty</p>
            <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-300/80">
              {selectedDifficulties.length === 0
                ? 'All difficulties'
                : 'Matching any selected level'}
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by difficulty"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <FilterChip
                  key={d}
                  pressed={selectedDifficulties.includes(d)}
                  onClick={() =>
                    setSelectedDifficulties((prev) => toggleFilter(prev, d))
                  }
                >
                  {d}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <p className="app-section-label">Confidence</p>
            <p className="mt-1 text-xs text-teal-800/80 dark:text-teal-300/80">
              {selectedConfidences.length === 0
                ? 'All confidence levels'
                : 'Matching any selected level'}
            </p>
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by confidence"
            >
              {CONFIDENCE_OPTIONS.map((c) => (
                <FilterChip
                  key={c}
                  pressed={selectedConfidences.includes(c)}
                  onClick={() =>
                    setSelectedConfidences((prev) => toggleFilter(prev, c))
                  }
                >
                  {confidenceLabel(c)}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-teal-800/85 dark:text-teal-300/85">
          Showing <strong>{filteredProblems.length}</strong> of{' '}
          {data.codingProblems.length} problems
          {hasActiveFilters ? (
            <span className="text-teal-700 dark:text-teal-300"> (filtered)</span>
          ) : null}
        </p>
      </section>

      <div className="space-y-6">
        {groups.length === 0 && hasActiveFilters ? (
          <p className="rounded-2xl border border-dashed border-teal-300/80 bg-white/60 px-4 py-8 text-center text-sm text-teal-800/90 dark:border-teal-800 dark:bg-zinc-900/40 dark:text-teal-300/90">
            No problems match these filters.{' '}
            <button
              type="button"
              className="font-semibold text-teal-700 underline-offset-2 hover:underline dark:text-teal-400"
              onClick={() => {
                setSelectedDifficulties([])
                setSelectedConfidences([])
              }}
            >
              Clear filters
            </button>
          </p>
        ) : null}
        {groups.map(([pat, problems]) => {
          const topicScore = problems.reduce(
            (sum, p) => sum + codingConfidenceWeight(p.confidence),
            0,
          )
          const topicPct = weightedReadinessPct(topicScore, problems.length)
          const confidentN = problems.filter(
            (p) => p.confidence === 'confident',
          ).length
          return (
            <section
              key={pat}
              className="overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-sm shadow-teal-900/[0.06] dark:border-teal-900/45 dark:bg-zinc-900/80 dark:shadow-none"
            >
              <div className="border-b border-teal-100 bg-teal-50/70 px-4 py-3 dark:border-teal-900/55 dark:bg-teal-950/25">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-teal-950 dark:text-teal-50">
                    {pat}
                  </h2>
                  <span className="text-xs font-medium text-teal-700/90 dark:text-teal-400/90">
                    {problems.length} problem{problems.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-3 text-xs font-medium text-teal-800 dark:text-teal-300/95">
                    <span className="text-teal-700/85 dark:text-teal-400/90">
                      Topic progress
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold">
                      {topicPct}%
                      <span className="font-normal text-teal-700/80 dark:text-teal-400/85">
                        {' '}
                        · {confidentN}/{problems.length} confident
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-teal-200/80 dark:bg-teal-900/70"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={topicPct}
                    aria-label={`${topicPct}% progress in ${pat}, ${confidentN} of ${problems.length} confident`}
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-out dark:bg-emerald-400"
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-teal-100 dark:divide-teal-900/45">
                {problems.map((p) => (
                  <li key={p.id} id={codingProblemListId(p.id)}>
                    <div className={confidenceRowClass(p.confidence)}>
                      {/* Line 1: identity + status + practice / log */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="shrink-0 rounded bg-teal-100/90 px-1 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                            {p.lcNumber}
                          </span>
                          <a
                            href={leetCodeProblemUrl(p)}
                            target="_blank"
                            rel="noreferrer"
                            className="app-link min-w-0 text-sm font-semibold leading-snug"
                          >
                            {p.title}
                          </a>
                          <span
                            className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyClass(p.difficulty)}`}
                          >
                            {p.difficulty}
                          </span>
                          <button
                            type="button"
                            className={confidenceBadgeClass(p.confidence)}
                            title="Click to cycle: not practiced → needs work → almost there → confident"
                            aria-label={`Confidence: ${confidenceLabel(p.confidence)}. Click to change.`}
                            onClick={() =>
                              updateCodingProblem(p.id, {
                                confidence: cycleCoding(p.confidence),
                              })
                            }
                          >
                            {confidenceLabel(p.confidence)}
                          </button>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap sm:gap-2.5">
                          <span className="text-sm font-semibold tabular-nums text-teal-900 dark:text-teal-100">
                            {p.practiceCount}{' '}
                            <span className="font-medium text-teal-700/90 dark:text-teal-400/90">
                              attempt{p.practiceCount === 1 ? '' : 's'}
                            </span>
                          </span>
                          <button
                            type="button"
                            className="app-btn-secondary whitespace-nowrap py-1.5 text-xs"
                            onClick={() =>
                              updateCodingProblem(p.id, {
                                practiceCount: p.practiceCount + 1,
                                lastPracticedDay: localDayKey(),
                              })
                            }
                          >
                            Log attempt
                          </button>
                        </div>
                      </div>

                      {/* Line 2: metadata + notes + delete (one anchored strip) */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-teal-700/90 dark:text-teal-400/85">
                        <span>
                          Last{' '}
                          <span className="font-semibold text-teal-900 dark:text-teal-200">
                            {formatPracticeDay(p.lastPracticedDay)}
                          </span>
                        </span>
                        {metaSep()}
                        <a
                          href={leetCodeProblemUrl(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-teal-700 underline-offset-2 hover:text-teal-900 hover:underline dark:text-teal-500 dark:hover:text-teal-300"
                        >
                          LeetCode
                        </a>
                        {metaSep()}
                        <button
                          type="button"
                          className={
                            notesEditorId === p.id
                              ? 'font-semibold text-teal-950 underline decoration-2 underline-offset-2 dark:text-teal-50'
                              : p.notes.trim()
                                ? 'font-medium text-teal-800 underline decoration-teal-400/70 decoration-1 underline-offset-2 hover:text-teal-950 dark:text-teal-300 dark:hover:text-teal-100'
                                : 'font-medium text-teal-700 hover:text-teal-950 hover:underline dark:text-teal-500 dark:hover:text-teal-200'
                          }
                          aria-expanded={notesEditorId === p.id}
                          aria-controls={`coding-notes-${p.id}`}
                          id={`coding-notes-trigger-${p.id}`}
                          onClick={() =>
                            setNotesEditorId((id) => (id === p.id ? null : p.id))
                          }
                        >
                          {notesEditorId === p.id ? 'Hide notes' : 'Notes'}
                        </button>
                        {metaSep()}
                        <button
                          type="button"
                          className="font-medium text-teal-400/90 transition-colors hover:text-red-600 dark:text-teal-600/75 dark:hover:text-red-400"
                          onClick={() => requestDeleteProblem(p)}
                        >
                          Delete
                        </button>
                      </div>

                      {notesEditorId === p.id ? (
                        <div
                          className="mt-2 border-l-2 border-teal-300/80 pl-3 dark:border-teal-700"
                          id={`coding-notes-${p.id}`}
                          role="region"
                          aria-labelledby={`coding-notes-trigger-${p.id}`}
                        >
                          <textarea
                            className="app-field min-h-[3.5rem] w-full resize-y py-2 text-sm leading-snug"
                            rows={3}
                            placeholder="Patterns, gotchas, solution sketch…"
                            value={p.notes}
                            onChange={(e) =>
                              updateCodingProblem(p.id, {
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {addProblemOpen ? (
        <section className="rounded-2xl border border-dashed border-teal-300/90 bg-white/80 p-4 dark:border-teal-700 dark:bg-zinc-900/60">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="app-section-heading">Add problem</h2>
            <button
              type="button"
              className="app-btn-secondary text-xs"
              onClick={() => setAddProblemOpen(false)}
            >
              Close
            </button>
          </div>
          <form onSubmit={addProblem} className="grid gap-3 sm:grid-cols-2">
            <input
              required
              className="app-field sm:col-span-2"
              placeholder="Title (matches LeetCode slug)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              required
              className="app-field"
              placeholder="LC #"
              inputMode="numeric"
              value={lc}
              onChange={(e) => setLc(e.target.value)}
            />
            <input
              required
              className="app-field"
              placeholder="Topic (e.g. Sliding Window, Dynamic Programming)"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-teal-900 sm:col-span-2 dark:text-teal-200">
              <span className="font-medium">Difficulty</span>
              <select
                className="app-field w-auto py-1.5"
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as Difficulty)
                }
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
            <button type="submit" className="app-btn-accent sm:col-span-2">
              Save problem
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-300/80 bg-transparent py-3.5 text-sm font-semibold text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-50/60 hover:text-teal-900 dark:border-teal-700/90 dark:text-teal-400 dark:hover:border-teal-500 dark:hover:bg-teal-950/30 dark:hover:text-teal-200"
          onClick={() => setAddProblemOpen(true)}
        >
          <span aria-hidden className="text-lg font-normal leading-none">
            +
          </span>
          Add problem
        </button>
      )}
    </div>
  )
}

function SuggestedProblemsSection({
  suggestions,
  onLogAttempt,
}: {
  suggestions: CodingSuggestion[]
  onLogAttempt: (p: CodingProblem) => void
}) {
  return (
    <section className="app-card space-y-4" aria-labelledby="coding-suggestions-heading">
      <div>
        <h2 id="coding-suggestions-heading" className="app-section-heading">
          Suggested for you
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-teal-800/90 dark:text-teal-300/85">
          Up next on the roadmap, plus problems that need another pass.
        </p>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm leading-relaxed text-teal-800/95 dark:text-teal-200/90">
          All tracked problems are confident — pick any from the list below for a
          refresh.
        </p>
      ) : (
        <ul className="divide-y divide-teal-100 dark:divide-teal-900/45">
          {suggestions.map(({ problem: p, reason }) => (
            <li key={p.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <span className={suggestionReasonChipClass(reason)}>
                  {suggestionReasonLabel(reason)}
                </span>
                <span className="shrink-0 rounded bg-teal-100/90 px-1 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                  {p.lcNumber}
                </span>
                <a
                  href={leetCodeProblemUrl(p)}
                  target="_blank"
                  rel="noreferrer"
                  className="app-link min-w-0 text-sm font-semibold leading-snug"
                >
                  {p.title}
                </a>
                <span
                  className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyClass(p.difficulty)}`}
                >
                  {p.difficulty}
                </span>
                <span
                  className={confidenceBadgeClass(p.confidence, false)}
                  aria-label={`Confidence: ${confidenceLabel(p.confidence)}`}
                >
                  {confidenceLabel(p.confidence)}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-teal-700/90 dark:text-teal-400/85">
                <span className="font-medium text-teal-800 dark:text-teal-300/90">
                  {p.pattern}
                </span>
                {reason === 'review' ? (
                  <>
                    {metaSep()}
                    <span>
                      Last{' '}
                      <span className="font-semibold text-teal-900 dark:text-teal-200">
                        {formatPracticeDay(p.lastPracticedDay)}
                      </span>
                    </span>
                  </>
                ) : null}
                <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
                  <button
                    type="button"
                    className="app-btn-secondary py-1.5 text-xs"
                    onClick={() => onLogAttempt(p)}
                  >
                    Log attempt
                  </button>
                  <button
                    type="button"
                    className="app-btn-ghost py-1.5 text-xs"
                    onClick={() => scrollToProblemInList(p.id)}
                  >
                    Open in list
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
