import { useState } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { Collapsible } from '../components/Collapsible'
import { cycleSystem } from '../utils/statusCycles'
import { StatusPill } from '../components/StatusPill'

const FRAMEWORK_STEPS = [
  {
    title: 'Clarify',
    body: 'Ask about scale, users, constraints.',
  },
  {
    title: 'Scope',
    body: 'Align on what you are solving today.',
  },
  {
    title: 'High-level design',
    body: 'Boxes and arrows, core components.',
  },
  {
    title: 'Deep dive',
    body: 'Drill into one or two critical components.',
  },
  {
    title: 'Tradeoffs',
    body: 'What you would do differently, what you deprioritized.',
  },
] as const

export function SystemDesignTab() {
  const {
    data,
    updateSystemTopic,
    deleteSystemTopic,
    addSystemTopic,
    addSystemResource,
    deleteSystemResource,
  } = useInterviewPrep()
  const [topicTitle, setTopicTitle] = useState('')
  const [resLabel, setResLabel] = useState('')
  const [resUrl, setResUrl] = useState('')

  function addTopic(e: React.FormEvent) {
    e.preventDefault()
    addSystemTopic(topicTitle)
    setTopicTitle('')
  }

  function addRes(e: React.FormEvent) {
    e.preventDefault()
    addSystemResource(resLabel, resUrl)
    setResLabel('')
    setResUrl('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">System design</h1>
        <p className="app-page-desc">
          Framework, canonical topics, and references.
        </p>
      </div>

      <section className="app-card">
        <h2 className="app-section-label">Five-step framework</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {FRAMEWORK_STEPS.map((step) => (
            <li key={step.title}>
              <span className="font-semibold text-teal-950 dark:text-teal-50">
                {step.title}
              </span>
              {' — '}
              {step.body}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="app-section-heading">Topics</h2>
        <ul className="space-y-3">
          {data.systemTopics.map((t) => (
            <li key={t.id} className="app-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <input
                  className="min-w-0 flex-1 border-b border-transparent bg-transparent text-base font-semibold text-teal-950 outline-none transition-colors duration-200 focus:border-teal-400 dark:text-teal-50 dark:focus:border-teal-500"
                  value={t.title}
                  onChange={(e) =>
                    updateSystemTopic(t.id, { title: e.target.value })
                  }
                />
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill
                    kind="system"
                    status={t.status}
                    onClick={() =>
                      updateSystemTopic(t.id, {
                        status: cycleSystem(t.status),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="app-btn-danger"
                    onClick={() => deleteSystemTopic(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <Collapsible title="Notes">
                  <textarea
                    className="app-field min-h-[5rem] w-full resize-y"
                    value={t.notes}
                    onChange={(e) =>
                      updateSystemTopic(t.id, { notes: e.target.value })
                    }
                  />
                </Collapsible>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="app-card">
        <h2 className="app-section-heading">Add topic</h2>
        <form onSubmit={addTopic} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="app-field min-w-0 flex-1"
            placeholder="Topic title"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
          />
          <button type="submit" className="app-btn-accent shrink-0">
            Add
          </button>
        </form>
      </section>

      <section className="app-card">
        <h2 className="app-section-heading">Resources</h2>
        <ul className="mt-3 space-y-2">
          {data.systemResources.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-100 px-3 py-2 text-sm dark:border-teal-800/70"
            >
              <a
                href={r.url}
                className="app-link"
                target="_blank"
                rel="noreferrer"
              >
                {r.label}
              </a>
              <button
                type="button"
                className="app-btn-danger"
                onClick={() => deleteSystemResource(r.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addRes} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="app-field min-w-0 flex-1"
            placeholder="Label"
            value={resLabel}
            onChange={(e) => setResLabel(e.target.value)}
          />
          <input
            className="app-field min-w-0 flex-1"
            placeholder="https://"
            value={resUrl}
            onChange={(e) => setResUrl(e.target.value)}
          />
          <button type="submit" className="app-btn-ghost shrink-0">
            Add resource
          </button>
        </form>
      </section>
    </div>
  )
}
