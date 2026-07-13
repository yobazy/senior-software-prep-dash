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
import {
  attemptKindCounts,
  daysBetweenLocalDays,
  hasPressureTestedAttempt,
  labelSystemAttemptKind,
  latestMockDay,
} from '../utils/systemAttempts'
import { StatusPill } from '../components/StatusPill'
import type { SystemAttemptKind, SystemTopic, SystemTopicTier } from '../types'

/** Alternate-Saturday cadence → nag after this many days without a mock. */
const MOCK_NAG_AFTER_DAYS = 14

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

function MockCadenceBanner({ topics }: { topics: SystemTopic[] }) {
  const today = localDayKey()
  const lastMock = latestMockDay(topics)
  const daysSince = lastMock === null ? null : daysBetweenLocalDays(lastMock, today)
  const overdue = lastMock === null || (daysSince !== null && daysSince >= MOCK_NAG_AFTER_DAYS)

  if (!overdue) {
    return (
      <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 px-3 py-2.5 text-sm text-teal-800 dark:border-teal-800/50 dark:bg-teal-950/20 dark:text-teal-200/90">
        Last mock{' '}
        <span className="font-semibold text-teal-950 dark:text-teal-50">
          {formatPracticeDay(lastMock)}
        </span>
        {daysSince !== null ? ` (${daysSince}d ago)` : ''}. Next due by day {MOCK_NAG_AFTER_DAYS}.
      </div>
    )
  }

  return (
    <div
      role="status"
      className="rounded-xl border border-amber-300/80 bg-amber-50/70 px-3 py-3 text-sm leading-relaxed text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <p className="font-semibold">Mock cadence overdue</p>
      <p className="mt-1 text-amber-900/95 dark:text-amber-100/90">
        {lastMock === null
          ? 'No mock logged yet. Book a 45-minute talk-out-loud (Hello Interview AI counts) and log it as Mock on a topic.'
          : `Last mock was ${formatPracticeDay(lastMock)} (${daysSince}d ago). Alternate-Saturday target is every ${MOCK_NAG_AFTER_DAYS} days — schedule one this week.`}
      </p>
    </div>
  )
}

function TopicRow({
  topic,
  notesOpen,
  onToggleNotes,
  onUpdate,
  onLogAttempt,
  onDelete,
  gateHint,
}: {
  topic: SystemTopic
  notesOpen: boolean
  onToggleNotes: () => void
  onUpdate: (patch: Partial<SystemTopic>) => void
  onLogAttempt: (kind: SystemAttemptKind) => void
  onDelete: () => void
  gateHint: boolean
}) {
  const canConfident = hasPressureTestedAttempt(topic)
  const counts = attemptKindCounts(topic)
  const isCaseStudy = topic.kind === 'case_study'

  return (
    <li className="app-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isCaseStudy ? (
            <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Case study
            </span>
          ) : null}
          <input
            className="w-full border-b border-transparent bg-transparent text-base font-semibold text-teal-950 outline-none transition-colors duration-200 focus:border-teal-400 dark:text-teal-50 dark:focus:border-teal-500"
            value={topic.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <StatusPill
            kind="system"
            status={topic.status}
            title={
              topic.status === 'studied' && !canConfident
                ? 'Log a solo-timed or mock attempt before marking Confident'
                : undefined
            }
            onClick={() => {
              const next = cycleSystem(topic.status, { canConfident })
              if (next === 'blocked_confident') {
                // Parent rejects Confident and surfaces the gate hint.
                onUpdate({ status: 'confident' })
                return
              }
              onUpdate({ status: next })
            }}
          />
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
        <span className="tabular-nums">
          <span className="font-semibold text-teal-900 dark:text-teal-200">
            {topic.practiceCount}
          </span>{' '}
          attempt{topic.practiceCount === 1 ? '' : 's'}
          {topic.practiceCount > 0 ? (
            <span className="text-teal-700/85 dark:text-teal-400/80">
              {' '}
              ({counts.solo} solo · {counts.solo_timed} timed · {counts.mock} mock)
            </span>
          ) : null}
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

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {(
          [
            ['solo', 'Solo'],
            ['solo_timed', 'Solo timed'],
            ['mock', 'Mock'],
          ] as const
        ).map(([kind, label]) => (
          <button
            key={kind}
            type="button"
            className="app-btn-secondary py-1 text-xs"
            title={`Log a ${labelSystemAttemptKind(kind).toLowerCase()} attempt`}
            onClick={() => onLogAttempt(kind)}
          >
            + {label}
          </button>
        ))}
      </div>

      {gateHint && topic.status === 'studied' && !canConfident ? (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200/90">
          Confident needs a solo-timed or mock attempt — reading alone stays at Studied.
        </p>
      ) : null}

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
    logSystemAttempt,
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
  const [gateHintId, setGateHintId] = useState<string | null>(null)

  const { caseStudies, tierGroups } = useMemo(() => {
    const caseStudies = data.systemTopics
      .filter((t) => t.kind === 'case_study')
      .sort((a, b) => a.title.localeCompare(b.title))

    const practice = data.systemTopics.filter((t) => t.kind !== 'case_study')
    const sorted = [...practice].sort(
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
    const tierGroups = order
      .filter((k) => groups.has(k))
      .map((k) => ({ tier: k, topics: groups.get(k)! }))
    return { caseStudies, tierGroups }
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

  function renderTopic(t: SystemTopic) {
    return (
      <TopicRow
        key={t.id}
        topic={t}
        notesOpen={notesEditorId === t.id}
        gateHint={gateHintId === t.id}
        onToggleNotes={() =>
          setNotesEditorId((id) => (id === t.id ? null : t.id))
        }
        onUpdate={(patch) => {
          if (
            patch.status !== undefined &&
            topicNeedsGateHint(t, patch.status)
          ) {
            setGateHintId(t.id)
            return
          }
          setGateHintId((id) => (id === t.id ? null : id))
          updateSystemTopic(t.id, patch)
        }}
        onLogAttempt={(kind) => {
          logSystemAttempt(t.id, kind)
          setGateHintId((id) => (id === t.id ? null : id))
        }}
        onDelete={() => {
          deleteSystemTopic(t.id)
          setNotesEditorId((id) => (id === t.id ? null : id))
          setGateHintId((id) => (id === t.id ? null : id))
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="app-page-heading">System design</h1>
        <p className="app-page-desc">
          Log typed attempts, cycle status when ready, and use notes for gaps. Overall{' '}
          {readiness.systemDesign}% ready. Confident requires a solo-timed or mock attempt.
        </p>
      </div>

      <MockCadenceBanner topics={data.systemTopics} />

      <section className="space-y-4">
        <div>
          <h2 className="app-section-heading">Problems — track practice</h2>
          <p className="mt-1 text-sm text-teal-800/90 dark:text-teal-300/85">
            Log <span className="font-medium">Solo</span>,{' '}
            <span className="font-medium">Solo timed</span> (talk out loud on a clock), or{' '}
            <span className="font-medium">Mock</span>. Status cycles Not started → Studied →
            Confident — Confident unlocks only after a timed or mock rep.
          </p>
        </div>

        {caseStudies.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-teal-800 dark:text-teal-300">
              Your systems — case studies
            </h3>
            <ul className="space-y-3">{caseStudies.map(renderTopic)}</ul>
          </div>
        ) : null}

        {tierGroups.map(({ tier, topics }) => (
          <div key={tier} className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight text-teal-800 dark:text-teal-300">
              {tierHeading(tier)}
            </h3>
            <ul className="space-y-3">{topics.map(renderTopic)}</ul>
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
          One-time setup tasks. Checkboxes save with the rest of this app in browser storage —
          export or back up occasionally if you clear site data.
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

function topicNeedsGateHint(
  topic: SystemTopic,
  nextStatus: SystemTopic['status'],
): boolean {
  return nextStatus === 'confident' && !hasPressureTestedAttempt(topic)
}
