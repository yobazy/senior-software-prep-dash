import { useMemo } from 'react'
import { useInterviewPrep } from '../context/InterviewPrepContext'
import { ProgressBar } from '../components/ProgressBar'
import { buildPracticeDayGroups } from '../utils/practiceDayGroups'
import { computeDayStreak } from '../utils/streak'
import type { PracticeEvent } from '../types'

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

function formatDayHeading(dayKey: string): string {
  try {
    const [y, m, d] = dayKey.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      dateStyle: 'medium',
    }).format(date)
  } catch {
    return dayKey
  }
}

function formatClock(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(
      new Date(iso),
    )
  } catch {
    return ''
  }
}

function bucketForEvent(ev: PracticeEvent): 'story' | 'coding' | 'system' {
  if (ev.track === 'story') return 'story'
  if (ev.track === 'coding') return 'coding'
  return 'system'
}

const bucketTitle: Record<'story' | 'coding' | 'system', string> = {
  story: 'Story',
  coding: 'Coding',
  system: 'System design',
}

const bucketLabelClass: Record<'story' | 'coding' | 'system', string> = {
  story: 'text-teal-800 dark:text-teal-200/95',
  coding: 'text-orange-900/95 dark:text-orange-200/95',
  system: 'text-teal-950 dark:text-teal-50',
}

export function HomeTab() {
  const { data, readiness } = useInterviewPrep()
  const streak = computeDayStreak(
    data.practiceEvents ?? [],
    data.sessionLog ?? [],
  )
  const dayGroups = useMemo(
    () =>
      buildPracticeDayGroups(
        data.practiceEvents ?? [],
        data.sessionLog ?? [],
      ),
    [data.practiceEvents, data.sessionLog],
  )

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
            consecutive days with practice recorded
          </span>
        </p>
      </section>

      <section className="app-card space-y-4">
        <div>
          <h2 className="app-section-heading">Practice log</h2>
          <p className="mt-2 text-sm leading-relaxed text-teal-800/90 dark:text-teal-300/85">
            Built from story, coding, and system-design status updates, plus system
            checklist items you complete. Older manual dashboard notes still count
            toward your streak and appear under each day when present.
          </p>
        </div>
        <ul className="app-divide">
          {dayGroups.length === 0 ? (
            <li className="py-8 text-center text-sm text-teal-800/75 dark:text-teal-300/80">
              No practice logged yet. Update a status pill on Story, Coding, or System
              design, or check off a task on the system design plan.
            </li>
          ) : (
            dayGroups.map((day) => {
              const storyEvs = day.events.filter((e) => bucketForEvent(e) === 'story')
              const codingEvs = day.events.filter((e) => bucketForEvent(e) === 'coding')
              const systemEvs = day.events.filter((e) => bucketForEvent(e) === 'system')
              const hasAuto =
                storyEvs.length > 0 || codingEvs.length > 0 || systemEvs.length > 0

              return (
                <li key={day.dayKey} className="py-4 text-left">
                  <p className="text-sm font-semibold text-teal-950 dark:text-teal-50">
                    {formatDayHeading(day.dayKey)}
                  </p>
                  {!hasAuto && day.legacyNotes.length === 0 ? (
                    <p className="mt-2 text-sm text-teal-800/75 dark:text-teal-300/80">
                      No entries.
                    </p>
                  ) : null}
                  {(['story', 'coding', 'system'] as const).map((bucket) => {
                    const list =
                      bucket === 'story'
                        ? storyEvs
                        : bucket === 'coding'
                          ? codingEvs
                          : systemEvs
                    if (list.length === 0) return null
                    return (
                      <div key={bucket} className="mt-3">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wider ${bucketLabelClass[bucket]}`}
                        >
                          {bucketTitle[bucket]}
                        </p>
                        <ul className="mt-1.5 space-y-2 pl-0">
                          {list.map((ev) => (
                            <li
                              key={ev.id}
                              className="text-sm leading-snug text-teal-900 dark:text-teal-100/95"
                            >
                              <span className="tabular-nums text-xs text-teal-600 dark:text-teal-400/90">
                                {formatClock(ev.at)}
                              </span>{' '}
                              <span className="font-medium">{ev.label}</span>
                              {ev.detail ? (
                                <span className="text-teal-800/90 dark:text-teal-300/85">
                                  {' '}
                                  — {ev.detail}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                  {day.legacyNotes.length > 0 ? (
                    <div className="mt-3 rounded-lg border border-teal-100/80 bg-teal-50/25 px-3 py-2 dark:border-teal-900/50 dark:bg-zinc-950/40">
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/85 dark:text-teal-400/80">
                        Earlier manual notes
                      </p>
                      <ul className="mt-2 space-y-2">
                        {day.legacyNotes.map((entry) => (
                          <li
                            key={entry.id}
                            className="text-sm text-teal-900 dark:text-teal-100/90"
                          >
                            <p>{entry.text}</p>
                            <p className="mt-0.5 text-xs text-teal-700/75 dark:text-teal-400/80">
                              {formatWhen(entry.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              )
            })
          )}
        </ul>
      </section>
    </div>
  )
}
