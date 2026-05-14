import { useMemo, useState } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { Collapsible } from '../components/Collapsible'
import { cycleCoding } from '../utils/statusCycles'
import { StatusPill } from '../components/StatusPill'
import { leetCodeProblemUrl } from '../utils/lcUrl'
import type { CodingProblem, Difficulty } from '../types'

function difficultyClass(d: Difficulty): string {
  if (d === 'Easy')
    return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
  if (d === 'Medium')
    return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
  return 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100'
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

  const groups = useMemo(() => {
    const map = new Map<string, CodingProblem[]>()
    for (const p of data.codingProblems) {
      const list = map.get(p.pattern) ?? []
      list.push(p)
      map.set(p.pattern, list)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">Coding</h1>
        <p className="app-page-desc">
          Patterns, LeetCode links, and solve tracking.
        </p>
      </div>

      <div className="space-y-8">
        {groups.map(([pat, problems]) => (
          <section key={pat}>
            <h2 className="app-section-label mb-3">{pat}</h2>
            <ul className="space-y-3">
              {problems.map((p) => (
                <li key={p.id} className="app-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={leetCodeProblemUrl(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="app-link text-sm"
                        >
                          {p.title}
                        </a>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${difficultyClass(p.difficulty)}`}
                        >
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-teal-800/75 dark:text-teal-400/80">
                        LC #{p.lcNumber} ·{' '}
                        <a
                          className="app-link font-medium"
                          href={leetCodeProblemUrl(p)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          leetcode.com
                        </a>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <StatusPill
                        kind="coding"
                        status={p.status}
                        onClick={() =>
                          updateCodingProblem(p.id, {
                            status: cycleCoding(p.status),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="app-btn-danger"
                        onClick={() => deleteCodingProblem(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Collapsible title="Notes">
                      <textarea
                        className="app-field min-h-[5rem] w-full resize-y"
                        value={p.notes}
                        onChange={(e) =>
                          updateCodingProblem(p.id, { notes: e.target.value })
                        }
                      />
                    </Collapsible>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="app-card">
        <h2 className="app-section-heading">Add problem</h2>
        <form onSubmit={addProblem} className="mt-3 grid gap-3 sm:grid-cols-2">
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
            placeholder="Pattern"
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
          <button
            type="submit"
            className="app-btn-accent sm:col-span-2"
          >
            Add problem
          </button>
        </form>
      </section>
    </div>
  )
}
