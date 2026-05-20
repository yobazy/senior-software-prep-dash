import { useMemo, useState } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { cycleStory } from '../utils/statusCycles'
import { leetCodeProblemUrl } from '../utils/lcUrl'
import { formatPracticeDay, localDayKey } from '../utils/localDay'
import { compareTopicPatterns } from '../utils/codingTopicOrder'
import type { CodingProblem, Difficulty, StoryStatus } from '../types'

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

function confidenceLabel(s: StoryStatus): string {
  if (s === 'not_practiced') return 'Not practiced'
  if (s === 'needs_work') return 'Needs work'
  return 'Confident'
}

function confidenceBadgeClass(s: StoryStatus): string {
  const base =
    'shrink-0 cursor-pointer rounded-lg border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none'
  if (s === 'not_practiced')
    return `${base} border-teal-300/90 bg-teal-100/90 text-teal-950 hover:bg-teal-200/70 focus-visible:outline-teal-600 dark:border-teal-700 dark:bg-teal-950/80 dark:text-teal-50 dark:hover:bg-teal-900/70 dark:focus-visible:outline-teal-400`
  if (s === 'needs_work')
    return `${base} border-amber-400/90 bg-amber-50 text-amber-950 hover:bg-amber-100/90 focus-visible:outline-amber-500 dark:border-amber-600 dark:bg-amber-950/55 dark:text-amber-100 dark:hover:bg-amber-900/45 dark:focus-visible:outline-amber-400`
  return `${base} border-emerald-400/90 bg-emerald-50 text-emerald-950 hover:bg-emerald-100/90 focus-visible:outline-emerald-600 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900/45 dark:focus-visible:outline-emerald-400`
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

  const groups = useMemo(() => {
    const map = new Map<string, CodingProblem[]>()
    for (const p of data.codingProblems) {
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
  }, [data.codingProblems])

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
          Roadmap-style topics (basics first), then easy → hard. Tap the status
          badge to cycle confidence; log attempts and notes stay on the same
          row as context.
        </p>
      </div>

      <div className="space-y-6">
        {groups.map(([pat, problems]) => {
          const confidentN = problems.filter(
            (p) => p.confidence === 'confident',
          ).length
          const topicPct = problems.length
            ? Math.round((confidentN / problems.length) * 100)
            : 0
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
                      Confident in topic
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold">
                      {confidentN}/{problems.length}
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-teal-200/80 dark:bg-teal-900/70"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={problems.length}
                    aria-valuenow={confidentN}
                    aria-label={`${confidentN} of ${problems.length} problems marked confident in ${pat}`}
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
                  <li key={p.id}>
                    <div className="px-3 py-2.5 transition-colors hover:bg-teal-50/35 dark:hover:bg-zinc-800/35 sm:px-4">
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
                            title="Click to cycle: not practiced → needs work → confident"
                            aria-label={`Confidence: ${confidenceLabel(p.confidence)}. Click to change.`}
                            onClick={() =>
                              updateCodingProblem(p.id, {
                                confidence: cycleStory(p.confidence),
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
