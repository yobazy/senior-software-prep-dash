import { useMemo, useState, type ReactNode } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { Collapsible } from '../components/Collapsible'
import {
  BUILDING_BLOCKS,
  CHECKLIST_PARALLEL,
  CHECKLIST_PHASE1_KICKOFF,
  CHECKLIST_PHASE2_HABIT,
  CHECKLIST_PHASE3,
} from '../data/systemDesignChecklist'
import {
  MOCK_STRUCTURE,
  PROBLEM_WORKFLOW,
  STALL_CHECKLIST,
  STUDY_QUESTIONS,
  WEEKLY_RHYTHM,
} from '../data/systemDesignPlan'
import { cycleSystem } from '../utils/statusCycles'
import { formatPracticeDay, localDayKey } from '../utils/localDay'
import { tierSortKey } from '../utils/systemTopicNormalize'
import { StatusPill } from '../components/StatusPill'
import type { SystemTopic, SystemTopicTier } from '../types'

function tierHeading(tier: SystemTopicTier | 0): string {
  if (tier === 1) return 'Tier 1'
  if (tier === 2) return 'Tier 2'
  if (tier === 3) return 'Tier 3'
  return 'Other topics'
}

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

function StudyPlanChecklist({
  isChecklistDone,
  onToggle,
}: {
  isChecklistDone: (id: string) => boolean
  onToggle: (taskId: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-teal-200/60 bg-teal-50/40 px-3 py-3 text-sm leading-relaxed text-teal-900 dark:border-teal-800/50 dark:bg-teal-950/25 dark:text-teal-100/95">
        <p className="font-semibold text-teal-950 dark:text-teal-50">What to do next</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-teal-800/95 dark:text-teal-200/90">
          <li>
            If any Phase 1 building-block row is unchecked, do the next one (weekday cadence:
            one block per day).
          </li>
          <li>
            Otherwise pick the next design problem (Tier 1 first) and log an attempt on that
            topic.
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
              onToggle={onToggle}
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
              onToggle={onToggle}
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
            <ChecklistRow id={t.id} checked={isChecklistDone(t.id)} onToggle={onToggle}>
              {t.label}
            </ChecklistRow>
          </li>
        ))}
      </ul>

      <ChecklistSectionTitle>Phase 3 — mocks setup</ChecklistSectionTitle>
      <ul className="space-y-2">
        {CHECKLIST_PHASE3.map((t) => (
          <li key={t.id}>
            <ChecklistRow id={t.id} checked={isChecklistDone(t.id)} onToggle={onToggle}>
              {t.label}
            </ChecklistRow>
          </li>
        ))}
      </ul>

      <ChecklistSectionTitle>Parallel track</ChecklistSectionTitle>
      <ul className="space-y-2">
        {CHECKLIST_PARALLEL.map((t) => (
          <li key={t.id}>
            <ChecklistRow id={t.id} checked={isChecklistDone(t.id)} onToggle={onToggle}>
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
            {WEEKLY_RHYTHM.map((row) => (
              <tr key={row.when}>
                <td className="px-3 py-2 font-medium whitespace-nowrap text-teal-800 dark:text-teal-200">
                  {row.when}
                </td>
                <td className="px-3 py-2 text-teal-800/95 dark:text-teal-200/90">{row.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReferenceGuide() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-teal-100 bg-teal-50/20 px-3 py-3 dark:border-teal-800/50 dark:bg-zinc-950/30">
        <h3 className="text-sm font-semibold text-teal-950 dark:text-teal-50">The core problem</h3>
        <p className="mt-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          Running out of things to say usually comes from one of two gaps: you do not yet know the
          building blocks well enough to go deep, or you are not asking yourself the right
          follow-up questions. Vocabulary first, then problem volume, then timed reps.
        </p>
      </section>

      <Collapsible title="45-minute interview structure">
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
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
      </Collapsible>

      <Collapsible title="When you stall on a component">
        <ul className="space-y-2 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {STALL_CHECKLIST.map((row) => (
            <li key={row.title}>
              <span className="font-semibold text-teal-950 dark:text-teal-50">{row.title}.</span>{' '}
              {row.prompt}
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible title="Phase 1 — Foundations (weeks 1–2)">
        <div className="space-y-3 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          <p>
            Build component vocabulary. Anchor on Xu Vol 1 Chapter 1; supplement each block with
            ByteByteGo shorts and Hello Interview concepts.
          </p>
          <Collapsible title="Five questions per building block">
            <ol className="list-decimal space-y-2 pl-5">
              {STUDY_QUESTIONS.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </Collapsible>
          <Collapsible title="The ten building blocks (study order)">
            <ol className="list-decimal space-y-3 pl-5">
              {BUILDING_BLOCKS.map((b) => (
                <li key={b.checklistId}>
                  <span className="font-semibold text-teal-950 dark:text-teal-50">{b.title}.</span>{' '}
                  {b.detail}
                </li>
              ))}
            </ol>
          </Collapsible>
        </div>
      </Collapsible>

      <Collapsible title="Phase 2 — Problems (weeks 3–8)">
        <div className="space-y-3 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          <p>
            Goal: recognize which primitives belong in the solution within the first ~2 minutes.
            Prioritize Tier 1, then Tier 2, then Tier 3.
          </p>
          <Collapsible title="How to run each problem">
            <ol className="list-decimal space-y-2 pl-5">
              {PROBLEM_WORKFLOW.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Collapsible>
        </div>
      </Collapsible>

      <Collapsible title="Phase 3 — Mock interviews (from week 4)">
        <p className="text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          Start timed mocks while gaps still feel uncomfortable. Hello Interview AI mocks work well
          for the first handful; after four or five, add live peer mocks.
        </p>
      </Collapsible>
    </div>
  )
}

function TopicRow({
  topic,
  notesOpen,
  onToggleNotes,
  onUpdate,
  onDelete,
}: {
  topic: SystemTopic
  notesOpen: boolean
  onToggleNotes: () => void
  onUpdate: (patch: Partial<SystemTopic>) => void
  onDelete: () => void
}) {
  return (
    <li className="app-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <input
          className="min-w-0 flex-1 border-b border-transparent bg-transparent text-base font-semibold text-teal-950 outline-none transition-colors duration-200 focus:border-teal-400 dark:text-teal-50 dark:focus:border-teal-500"
          value={topic.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusPill
            kind="system"
            status={topic.status}
            onClick={() => onUpdate({ status: cycleSystem(topic.status) })}
          />
          <span className="text-sm font-semibold tabular-nums text-teal-900 dark:text-teal-100">
            {topic.practiceCount}{' '}
            <span className="font-medium text-teal-700/90 dark:text-teal-400/90">
              attempt{topic.practiceCount === 1 ? '' : 's'}
            </span>
          </span>
          <button
            type="button"
            className="app-btn-secondary whitespace-nowrap py-1.5 text-xs"
            onClick={() =>
              onUpdate({
                practiceCount: topic.practiceCount + 1,
                lastPracticedDay: localDayKey(),
              })
            }
          >
            Log attempt
          </button>
          <button type="button" className="app-btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-teal-700/90 dark:text-teal-400/85">
        <span>
          Last practiced{' '}
          <span className="font-semibold text-teal-900 dark:text-teal-200">
            {formatPracticeDay(topic.lastPracticedDay)}
          </span>
        </span>
        <span className="text-teal-300/90 select-none dark:text-teal-700" aria-hidden>
          ·
        </span>
        <button
          type="button"
          className={
            notesOpen
              ? 'font-semibold text-teal-950 underline decoration-2 underline-offset-2 dark:text-teal-50'
              : topic.notes.trim()
                ? 'font-medium text-teal-800 underline decoration-teal-400/70 decoration-1 underline-offset-2 hover:text-teal-950 dark:text-teal-300'
                : 'font-medium text-teal-700 hover:text-teal-950 hover:underline dark:text-teal-500'
          }
          onClick={onToggleNotes}
        >
          {notesOpen ? 'Hide notes' : 'Notes'}
        </button>
      </div>
      {notesOpen ? (
        <textarea
          className="app-field mt-2 min-h-[5rem] w-full resize-y"
          placeholder="Gaps, Xu chapter refs, where you stalled…"
          value={topic.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
        />
      ) : null}
    </li>
  )
}

export function SystemDesignTab() {
  const {
    data,
    readiness,
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
  const [notesEditorId, setNotesEditorId] = useState<string | null>(null)

  const tierGroups = useMemo(() => {
    const sorted = [...data.systemTopics].sort(
      (a, b) => tierSortKey(a) - tierSortKey(b) || a.title.localeCompare(b.title),
    )
    const groups = new Map<number, SystemTopic[]>()
    for (const t of sorted) {
      const key = t.tier ?? 0
      const list = groups.get(key) ?? []
      list.push(t)
      groups.set(key, list)
    }
    const order = [1, 2, 3, 0] as const
    return order
      .filter((k) => groups.has(k))
      .map((k) => ({ tier: k, topics: groups.get(k)! }))
  }, [data.systemTopics])

  const checklistDone = data.systemChecklistDone ?? []
  const isChecklistDone = (id: string) => checklistDone.includes(id)

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
          Log attempts on each problem, cycle status when ready, and use notes for gaps. Overall{' '}
          {readiness.systemDesign}% ready. Study plan and reference material are below.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="app-section-heading">Problems — track practice</h2>
          <p className="mt-1 text-sm text-teal-800/90 dark:text-teal-300/85">
            <span className="font-medium">Log attempt</span> after each solo pass or mock. Click the
            pill to cycle Not started → Studied → Confident.
          </p>
        </div>
        {tierGroups.map(({ tier, topics }) => (
          <div key={tier} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-teal-800 dark:text-teal-300">
              {tierHeading(tier)}
            </h3>
            <ul className="space-y-3">
              {topics.map((t) => (
                <TopicRow
                  key={t.id}
                  topic={t}
                  notesOpen={notesEditorId === t.id}
                  onToggleNotes={() =>
                    setNotesEditorId((id) => (id === t.id ? null : t.id))
                  }
                  onUpdate={(patch) => updateSystemTopic(t.id, patch)}
                  onDelete={() => {
                    deleteSystemTopic(t.id)
                    setNotesEditorId((id) => (id === t.id ? null : id))
                  }}
                />
              ))}
            </ul>
          </div>
        ))}
        <form onSubmit={addTopic} className="flex flex-col gap-2 sm:flex-row">
          <input
            className="app-field min-w-0 flex-1"
            placeholder="Add a topic"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
          />
          <button type="submit" className="app-btn-accent shrink-0">
            Add topic
          </button>
        </form>
      </section>

      <Collapsible title="Study plan & checklist" defaultOpen={false}>
        <p className="mb-3 text-sm text-teal-800/90 dark:text-teal-300/85">
          One-time setup tasks. Checkboxes save in this browser.
        </p>
        <StudyPlanChecklist
          isChecklistDone={isChecklistDone}
          onToggle={toggleSystemChecklistTask}
        />
      </Collapsible>

      <Collapsible title="Reference guide" defaultOpen={false}>
        <ReferenceGuide />
      </Collapsible>

      <section className="app-card space-y-4">
        <div>
          <h2 className="app-section-heading">Books & resources</h2>
          <p className="mt-2 text-sm text-teal-800/90 dark:text-teal-300/85">
            Ranked study order. Add bookmarks for specific Hello Interview problem pages.
          </p>
        </div>
        <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-teal-900 dark:text-teal-100/95">
          {data.systemResources.map((r, i) => (
            <li key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <a
                    href={r.url}
                    className="app-link font-semibold"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {i + 1}. {r.label}
                  </a>
                  {r.note ? (
                    <p className="mt-1 text-teal-800/90 dark:text-teal-300/85">{r.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="app-btn-danger shrink-0"
                  onClick={() => deleteSystemResource(r.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        <form onSubmit={addRes} className="flex flex-col gap-2 sm:flex-row">
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
