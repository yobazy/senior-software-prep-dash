import { useState } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { ProgressBar } from '../components/ProgressBar'
import { computeDayStreak } from '../utils/streak'

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

export function HomeTab() {
  const { data, addSession, readiness } = useInterviewPrep()
  const [draft, setDraft] = useState('')
  const streak = computeDayStreak(data.sessionLog)
  const recent = data.sessionLog.slice(0, 10)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    addSession(draft)
    setDraft('')
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="app-page-heading">Dashboard</h1>
        <p className="app-page-desc">
          Readiness across story, coding, and system design.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="app-card">
          <ProgressBar label="Story" value={readiness.story} tone="story" />
        </div>
        <div className="app-card">
          <ProgressBar label="Coding" value={readiness.coding} tone="coding" />
        </div>
        <div className="app-card">
          <ProgressBar
            label="System design"
            value={readiness.systemDesign}
            tone="system"
          />
        </div>
      </section>

      <section className="app-card">
        <h2 className="app-section-heading">Day streak</h2>
        <p className="mt-3 text-3xl font-semibold tabular-nums text-teal-950 dark:text-teal-50">
          {streak}
          <span className="ml-2 text-base font-normal text-teal-800/80 dark:text-teal-300/85">
            consecutive days with a session logged
          </span>
        </p>
      </section>

      <section className="app-card space-y-4">
        <h2 className="app-section-heading">Session log</h2>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="session-log-input">
            What you worked on
          </label>
          <input
            id="session-log-input"
            className="app-field flex-1"
            placeholder="What did you work on today?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="app-btn-accent shrink-0">
            Log session
          </button>
        </form>
        <ul className="app-divide">
          {recent.length === 0 ? (
            <li className="py-8 text-center text-sm text-teal-800/75 dark:text-teal-300/80">
              No sessions yet. Log what you practiced.
            </li>
          ) : (
            recent.map((entry) => (
              <li key={entry.id} className="py-3 text-left">
                <p className="text-sm text-teal-950 dark:text-teal-100">
                  {entry.text}
                </p>
                <p className="mt-1 text-xs text-teal-700/75 dark:text-teal-400/80">
                  {formatWhen(entry.createdAt)}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
