import { useState, type ReactNode } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { Collapsible } from '../components/Collapsible'
import { cycleSystem } from '../utils/statusCycles'
import { StatusPill } from '../components/StatusPill'

const MOCK_STRUCTURE = [
  { minutes: 5, title: 'Requirements', body: 'Functional and non-functional requirements; clarify scale.' },
  { minutes: 5, title: 'High-level design', body: 'Boxes and arrows; agree on scope.' },
  { minutes: 25, title: 'Deep dive', body: 'Two components in depth — where vocabulary and follow-ups matter most.' },
  { minutes: 10, title: 'Tradeoffs and follow-ups', body: 'What you would change, what breaks, what you would do with more time.' },
] as const

const STALL_CHECKLIST = [
  { title: 'Failure modes', prompt: 'What happens when this fails?' },
  { title: 'Scaling', prompt: 'How does this behave at 10× load?' },
  { title: 'Observability', prompt: 'How would I monitor this?' },
  { title: 'Performance', prompt: 'What is the latency of this operation?' },
  { title: 'Consistency', prompt: 'What is the consistency model here?' },
  { title: 'Tradeoffs', prompt: 'What is the cost or complexity of this choice?' },
] as const

/** Study order: message queues first (your RabbitMQ background), then the rest of the vocabulary. */
const BUILDING_BLOCKS = [
  {
    checklistId: 'bb-queues',
    title: 'Message queues',
    detail:
      'At-least-once vs exactly-once, consumer groups, backpressure, dead letter queues.',
  },
  {
    checklistId: 'bb-lb',
    title: 'Load balancers',
    detail: 'L4 vs L7, algorithms, health checks, sticky sessions.',
  },
  {
    checklistId: 'bb-cache',
    title: 'Caching',
    detail: 'Eviction policies, invalidation strategies, Redis vs Memcached, where to put it.',
  },
  {
    checklistId: 'bb-db',
    title: 'Databases',
    detail: 'SQL vs NoSQL, replication, sharding, indexing, CAP theorem.',
  },
  {
    checklistId: 'bb-cdn',
    title: 'CDNs',
    detail: 'Push vs pull, cache-control headers, origin shield.',
  },
  {
    checklistId: 'bb-rl',
    title: 'Rate limiting',
    detail: 'Token bucket vs leaky bucket vs sliding window; where to enforce it.',
  },
  {
    checklistId: 'bb-api',
    title: 'API design',
    detail: 'REST vs gRPC, API gateways, versioning, idempotency.',
  },
  {
    checklistId: 'bb-search',
    title: 'Search',
    detail: 'Inverted indexes, Elasticsearch basics, relevance ranking.',
  },
  {
    checklistId: 'bb-storage',
    title: 'Storage',
    detail: 'Blob vs block vs object; S3-compatible patterns.',
  },
  {
    checklistId: 'bb-obs',
    title: 'Observability',
    detail: 'Metrics, tracing, structured logging, alerting.',
  },
] as const

const CHECKLIST_PHASE1_KICKOFF = [
  {
    id: 'p1-xu-ch1',
    label:
      'Skim Alex Xu Vol 1 Chapter 1 as anchor; note terms you will revisit per block.',
  },
  {
    id: 'p1-bookmarks',
    label:
      'Bookmark Hello Interview concepts and ByteByteGo; pick where you will write the five answers (doc or paper).',
  },
] as const

const CHECKLIST_PHASE2_HABIT = [
  {
    id: 'p2-three-step',
    label:
      'On every new design problem: solo ~20 min (no solutions) → read Xu / Hello Interview + gap list → redo missed parts on paper or Excalidraw.',
  },
] as const

const CHECKLIST_PHASE3 = [
  {
    id: 'p3-mock-log',
    label:
      'Create a mock log (date, topic, where you stalled, which stall-checklist prompts you forgot).',
  },
  {
    id: 'p3-calendar',
    label:
      'Block every other Saturday from week 4 onward: 45-minute timed mock.',
  },
  {
    id: 'p3-stall-practice',
    label:
      'Practice the stall checklist until it is automatic (run it out loud after each component).',
  },
  {
    id: 'p3-ai-mocks',
    label: 'Complete 4–5 Hello Interview AI mocks for early reps.',
  },
  {
    id: 'p3-live-mocks',
    label: 'Add live peer mocks once AI mocks feel repetitive.',
  },
] as const

const CHECKLIST_PARALLEL = [
  {
    id: 'parallel-ddia',
    label:
      'DDIA (Kleppmann): parallel slow read — prioritize database, queue, and replication chapters.',
  },
] as const

const STUDY_QUESTIONS = [
  'What does this component do?',
  'When would I choose this over alternatives?',
  'What breaks under high load?',
  'How do I make it fault tolerant?',
  'What does it cost me (latency, money, complexity)?',
] as const

const PROBLEM_WORKFLOW = [
  'Spend ~20 minutes designing solo on paper or Excalidraw before reading any solution. Capture requirements, components, capacity estimates, and deep dives.',
  'Read the Xu chapter or Hello Interview walkthrough. List every gap between your attempt and the reference — those gaps are your study queue.',
  'Redo the parts you missed on paper or in the diagram; do not stop at “I get it now.”',
] as const

const RANKED_RESOURCES = [
  {
    rank: 1,
    label: 'Alex Xu — System Design Interview Vol 1',
    note: 'Spine: do every Tier 1 and Tier 2 problem that has a chapter.',
    href: 'https://www.amazon.com/s?k=system+design+alex+xu+vol+1',
  },
  {
    rank: 2,
    label: 'Hello Interview',
    note: 'Structured walkthroughs and AI mock interviews.',
    href: 'https://www.hellointerview.com/',
  },
  {
    rank: 3,
    label: 'ByteByteGo',
    note: 'Short concept videos during lunch.',
    href: 'https://bytebytego.com',
  },
  {
    rank: 4,
    label: 'Alex Xu — Vol 2',
    note: 'After the relevant Vol 1 chapters; harder depth.',
    href: 'https://www.amazon.com/s?k=system+design+alex+xu+vol+2',
  },
  {
    rank: 5,
    label: 'Designing Data-Intensive Applications (Kleppmann)',
    note: 'Parallel track over a few months — databases, queues, replication for real depth.',
    href: 'https://www.amazon.com/s?k=designing+data-intensive+applications',
  },
] as const

function ChecklistSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-teal-700/80 first:mt-0 dark:text-teal-400/90">
      {children}
    </h3>
  )
}

function ChecklistRow({
  id,
  checked,
  onToggle,
  children,
}: {
  id: string
  checked: boolean
  onToggle: (taskId: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-teal-100/80 bg-teal-50/20 px-3 py-2.5 transition-colors hover:bg-teal-50/50 dark:border-teal-800/40 dark:bg-zinc-950/30 dark:hover:bg-zinc-900/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="mt-0.5 size-4 shrink-0 rounded border-teal-300 text-teal-600 focus:ring-teal-500 dark:border-teal-600 dark:bg-zinc-900 dark:text-teal-500"
      />
      <span className="text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
        {children}
      </span>
    </label>
  )
}

export function SystemDesignTab() {
  const {
    data,
    updateSystemTopic,
    deleteSystemTopic,
    addSystemTopic,
    addSystemResource,
    deleteSystemResource,
    toggleSystemChecklistTask,
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

  const checklistDone = data.systemChecklistDone ?? []
  const isChecklistDone = (id: string) => checklistDone.includes(id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">System design</h1>
        <p className="app-page-desc">
          Three phases: vocabulary, problems, mocks — plus weekly cadence and ranked resources.
        </p>
      </div>

      <section className="app-card space-y-3">
        <div>
          <h2 className="app-section-label">Your task list</h2>
          <p className="mt-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
            Work top to bottom. Checkboxes save in this browser. Tier problems also use status pills
            in <span className="font-medium">Problems — track status</span> below.
          </p>
        </div>

        <div className="rounded-xl border border-teal-200/60 bg-teal-50/40 px-3 py-3 text-sm leading-relaxed text-teal-900 dark:border-teal-800/50 dark:bg-teal-950/25 dark:text-teal-100/95">
          <p className="font-semibold text-teal-950 dark:text-teal-50">What to do next</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-teal-800/95 dark:text-teal-200/90">
            <li>
              If any Phase 1 building-block row is unchecked, do the next one (weekday cadence: one
              block per day).
            </li>
            <li>
              Otherwise pick the next design problem (Tier 1 first) and run the three-step habit
              checkbox.
            </li>
            <li>
              From week 4 on, keep every-other-Saturday mocks on the calendar even when it feels
              early.
            </li>
          </ul>
        </div>

        <ChecklistSectionTitle>Phase 1 — before blocks</ChecklistSectionTitle>
        <ul className="space-y-2">
          {CHECKLIST_PHASE1_KICKOFF.map((t) => (
            <li key={t.id}>
              <ChecklistRow
                id={t.id}
                checked={isChecklistDone(t.id)}
                onToggle={toggleSystemChecklistTask}
              >
                {t.label}
              </ChecklistRow>
            </li>
          ))}
        </ul>

        <ChecklistSectionTitle>Phase 1 — each building block (full mini-loop)</ChecklistSectionTitle>
        <p className="text-xs leading-relaxed text-teal-800/90 dark:text-teal-300/85">
          Per block: study (Xu Ch.1 anchor + ByteByteGo + Hello Interview concepts) → write answers
          to the five questions → close notes and self-quiz from memory.
        </p>
        <ul className="mt-2 space-y-2">
          {BUILDING_BLOCKS.map((b) => (
            <li key={b.checklistId}>
              <ChecklistRow
                id={b.checklistId}
                checked={isChecklistDone(b.checklistId)}
                onToggle={toggleSystemChecklistTask}
              >
                <span className="font-semibold text-teal-950 dark:text-teal-50">{b.title}.</span>{' '}
                <span className="text-teal-800/95 dark:text-teal-200/90">{b.detail}</span>
              </ChecklistRow>
            </li>
          ))}
        </ul>

        <ChecklistSectionTitle>Phase 2 — every problem</ChecklistSectionTitle>
        <ul className="space-y-2">
          {CHECKLIST_PHASE2_HABIT.map((t) => (
            <li key={t.id}>
              <ChecklistRow
                id={t.id}
                checked={isChecklistDone(t.id)}
                onToggle={toggleSystemChecklistTask}
              >
                {t.label}
              </ChecklistRow>
            </li>
          ))}
        </ul>

        <ChecklistSectionTitle>Phase 3 — mocks setup</ChecklistSectionTitle>
        <ul className="space-y-2">
          {CHECKLIST_PHASE3.map((t) => (
            <li key={t.id}>
              <ChecklistRow
                id={t.id}
                checked={isChecklistDone(t.id)}
                onToggle={toggleSystemChecklistTask}
              >
                {t.label}
              </ChecklistRow>
            </li>
          ))}
        </ul>

        <ChecklistSectionTitle>Parallel track</ChecklistSectionTitle>
        <ul className="space-y-2">
          {CHECKLIST_PARALLEL.map((t) => (
            <li key={t.id}>
              <ChecklistRow
                id={t.id}
                checked={isChecklistDone(t.id)}
                onToggle={toggleSystemChecklistTask}
              >
                {t.label}
              </ChecklistRow>
            </li>
          ))}
        </ul>

        <ChecklistSectionTitle>Weekly rhythm (~4–5 hours)</ChecklistSectionTitle>
        <div className="overflow-x-auto rounded-xl border border-teal-100 text-sm dark:border-teal-800/60">
          <table className="w-full min-w-[280px] border-collapse text-left text-teal-900 dark:text-teal-100/95">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50/50 dark:border-teal-800/60 dark:bg-zinc-950/50">
                <th className="px-3 py-2 font-semibold text-teal-950 dark:text-teal-50">When</th>
                <th className="px-3 py-2 font-semibold text-teal-950 dark:text-teal-50">Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-100 dark:divide-teal-800/50">
              <tr>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-teal-800 dark:text-teal-200">
                  Monday
                </td>
                <td className="px-3 py-2 text-teal-800/95 dark:text-teal-200/90">
                  One building block (or review a weak block), ~30–45 min.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-teal-800 dark:text-teal-200">
                  Wednesday
                </td>
                <td className="px-3 py-2 text-teal-800/95 dark:text-teal-200/90">
                  One problem: solo + review + gaps, ~90 min.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-teal-800 dark:text-teal-200">
                  Friday
                </td>
                <td className="px-3 py-2 text-teal-800/95 dark:text-teal-200/90">
                  Second problem or deeper redo, ~60 min.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-teal-800 dark:text-teal-200">
                  Alt. Saturday
                </td>
                <td className="px-3 py-2 text-teal-800/95 dark:text-teal-200/90">
                  Timed mock from week 4, 45 min.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="app-card">
        <h2 className="app-section-label">The core problem</h2>
        <p className="mt-3 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          Running out of things to say usually comes from one of two gaps: you do not yet know the
          building blocks well enough to go deep, or you are not asking yourself the right
          follow-up questions. The plan below addresses both — vocabulary first, then problem
          volume, then timed reps.
        </p>
      </section>

      <section className="app-card">
        <h2 className="app-section-label">45-minute interview structure</h2>
        <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
          Use this breakdown in mocks from week 4 onward. Feeling ready is optional; the reps
          create readiness.
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {MOCK_STRUCTURE.map((step) => (
            <li key={step.title}>
              <span className="font-semibold text-teal-950 dark:text-teal-50">
                {step.minutes} min — {step.title}
              </span>
              {' — '}
              {step.body}
            </li>
          ))}
        </ol>
      </section>

      <section className="app-card">
        <h2 className="app-section-label">When you stall on a component</h2>
        <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
          After you finish explaining a piece and feel stuck, run this checklist until it becomes
          automatic.
        </p>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {STALL_CHECKLIST.map((row) => (
            <li key={row.title}>
              <span className="font-semibold text-teal-950 dark:text-teal-50">{row.title}.</span>{' '}
              {row.prompt}
            </li>
          ))}
        </ul>
      </section>

      <section className="app-card space-y-4">
        <div>
          <h2 className="app-section-heading">Phase 1 — Foundations (weeks 1–2)</h2>
          <p className="mt-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
            Build component vocabulary. Almost every prompt is a composition of the same handful of
            primitives. Anchor on Xu Vol 1 Chapter 1; supplement each block with ByteByteGo shorts
            and Hello Interview concepts — same material, pick what clicks.
          </p>
          <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
            Cadence: one building block per weekday. About 30–45 minutes per block.
          </p>
        </div>
        <Collapsible title="Five questions per building block" defaultOpen>
          <ol className="list-decimal space-y-2 pl-5">
            {STUDY_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </Collapsible>
        <Collapsible title="The ten building blocks (study order)" defaultOpen>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
            {BUILDING_BLOCKS.map((b) => (
              <li key={b.title}>
                <span className="font-semibold text-teal-950 dark:text-teal-50">{b.title}.</span>{' '}
                {b.detail}
              </li>
            ))}
          </ol>
        </Collapsible>
      </section>

      <section className="app-card space-y-4">
        <div>
          <h2 className="app-section-heading">Phase 2 — Problems (weeks 3–8)</h2>
          <p className="mt-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
            Goal: do enough designs that in the first ~2 minutes you recognize which primitives
            belong in the solution. Prioritize Tier 1 for platform and auth-shaped roles, then Tier 2
            for breadth, Tier 3 when you feel solid.
          </p>
          <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
            Cadence: about two to three problems per week (~90 minutes each when done properly).
          </p>
        </div>
        <Collapsible title="How to run each problem" defaultOpen>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
            {PROBLEM_WORKFLOW.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Collapsible>
        <div className="rounded-xl border border-teal-100 bg-teal-50/30 px-3 py-3 text-sm leading-relaxed text-teal-900 dark:border-teal-800/60 dark:bg-zinc-950/40 dark:text-teal-100/95">
          <p className="font-semibold text-teal-950 dark:text-teal-50">Tier 1</p>
          <p className="mt-1">
            Rate limiter · Authentication / OAuth · URL shortener · Notification system · API
            gateway
          </p>
          <p className="mt-3 font-semibold text-teal-950 dark:text-teal-50">Tier 2</p>
          <p className="mt-1">
            Chat system · Key-value store · Distributed job scheduler · Metrics and alerting
            platform · Search autocomplete
          </p>
          <p className="mt-3 font-semibold text-teal-950 dark:text-teal-50">Tier 3</p>
          <p className="mt-1">
            YouTube / Netflix · Distributed transactions · Google Maps
          </p>
        </div>
      </section>

      <section className="app-card space-y-3">
        <h2 className="app-section-heading">Phase 3 — Mock interviews (ongoing from week 4)</h2>
        <p className="text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          Start timed mocks while gaps still feel uncomfortable. Hello Interview AI mocks work well
          for the first handful; after four or five, add live peer mocks (Blind, Reddit
          r/cscareerquestions, or a study partner).
        </p>
      </section>

      <section className="app-card space-y-4">
        <h2 className="app-section-heading">Books and resources (ranked)</h2>
        <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {RANKED_RESOURCES.map((r) => (
            <li key={r.rank}>
              <a href={r.href} className="app-link font-semibold" target="_blank" rel="noreferrer">
                {r.label}
              </a>
              <p className="mt-1 text-teal-800/90 dark:text-teal-300/85">{r.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="app-section-heading">Problems — track status</h2>
          <p className="mt-1 text-sm text-teal-800/90 dark:text-teal-300/85">
            Click the pill to cycle Not started → Studied → Confident. Use notes for gaps, Xu
            chapter refs, or redo targets.
          </p>
        </div>
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
        <h2 className="app-section-heading">Your links</h2>
        <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
          Editable list — add bookmarks (e.g. specific Hello Interview problem pages).
        </p>
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
            Add link
          </button>
        </form>
      </section>
    </div>
  )
}
