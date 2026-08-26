import { useCallback, useEffect, useMemo, useState } from 'react'
import { countdownLabel } from '../livePack/dates'
import { parsePrepCorpus } from '../livePack/parsePrep'
import type { DrillCard, PrepCorpus, PrepFile } from '../livePack/types'
import { DraftBadge, Prose, Spoken, TodoBadge } from './livePack/packBits'

const FOLDER_KEY = 'live-pack-folder'
const DEFAULT_FOLDER = '/Users/bazil/Documents/interview-prep'

type ViewId = 'tonight' | 'drill' | 'stories' | 'projects' | 'feedback' | 'files'

type FilesResponse = {
  root?: string
  generatedAt?: string
  files?: PrepFile[]
  warnings?: string[]
  suggestedRoot?: string
  error?: string
}

function rehearsalKey(root: string) {
  return `live-pack-rehearsed:${root}`
}

function readRehearsed(root: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(rehearsalKey(root))
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}

export function LivePackTab() {
  const [folderInput, setFolderInput] = useState('')
  const [root, setRoot] = useState('')
  const [files, setFiles] = useState<PrepFile[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [view, setView] = useState<ViewId>('tonight')
  const [rehearsed, setRehearsed] = useState<Record<string, string>>({})
  const [drillId, setDrillId] = useState<string | null>(null)
  const [drillQuery, setDrillQuery] = useState('')
  const [drillFilter, setDrillFilter] = useState<'all' | 'open' | 'live' | 'unrehearsed'>(
    'all',
  )

  const corpus = useMemo(() => parsePrepCorpus(files), [files])

  const load = useCallback(async (folder: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/interview-prep/files?root=${encodeURIComponent(folder)}`
      const res = await fetch(url)
      const json = (await res.json()) as FilesResponse
      if (!res.ok || json.error) {
        setFiles([])
        setError(json.error ?? `Request failed (${res.status})`)
        setWarnings([])
        return
      }
      const nextRoot = json.root ?? folder
      setRoot(nextRoot)
      setFiles(Array.isArray(json.files) ? json.files : [])
      setWarnings(json.warnings ?? [])
      setGeneratedAt(json.generatedAt ?? null)
      localStorage.setItem(FOLDER_KEY, nextRoot)
      setRehearsed(readRehearsed(nextRoot))
    } catch (e) {
      setFiles([])
      setError(
        e instanceof Error
          ? e.message
          : 'Could not load files. This tab needs `npm run dev`.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const saved = localStorage.getItem(FOLDER_KEY) ?? ''
      let suggested = ''
      try {
        const res = await fetch('/api/interview-prep/meta')
        const json = (await res.json()) as { suggestedRoot?: string }
        suggested = json.suggestedRoot?.trim() ?? ''
      } catch {
        /* preview build has no API */
      }
      if (cancelled) return
      const start = saved || suggested || DEFAULT_FOLDER
      setFolderInput(start)
      await load(start)
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  useEffect(() => {
    function onFocus() {
      if (root) void load(root)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load, root])

  function toggleRehearsed(id: string) {
    setRehearsed((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = new Date().toISOString()
      if (root) localStorage.setItem(rehearsalKey(root), JSON.stringify(next))
      return next
    })
  }

  function openDrill(id: string) {
    setDrillId(id)
    setView('drill')
  }

  const when = countdownLabel(corpus.coaching?.interviewDate ?? null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="app-page-heading">Live pack</h1>
        <p className="app-page-desc">
          Call sheet, story bank, and question drill from a folder of markdown
          files. Edit the files in your editor, then reload.
        </p>
      </div>

      <form
        className="app-card space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (folderInput.trim()) void load(folderInput.trim())
        }}
      >
        <label htmlFor="prep-folder" className="app-section-label">
          Prep folder
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="prep-folder"
            className="app-field flex-1 font-mono text-xs"
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            placeholder={DEFAULT_FOLDER}
            spellCheck={false}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button type="submit" className="app-btn-primary" disabled={loading}>
              {loading ? 'Loading…' : 'Load'}
            </button>
            <button
              type="button"
              className="app-btn-secondary"
              disabled={loading || !root}
              onClick={() => root && void load(root)}
            >
              Reload
            </button>
          </div>
        </div>
        <p className="text-xs text-teal-800/80 dark:text-teal-300/85">
          Absolute path. The Vite dev server reads `.md` files from that folder
          (no upload). Reload after you save a file, or click back into this
          window.
        </p>
        {generatedAt && root ? (
          <p className="text-xs text-teal-700/80 dark:text-teal-400/85">
            {files.length} file{files.length === 1 ? '' : 's'} from{' '}
            <span className="font-mono">{root}</span>
            {' · '}
            {new Date(generatedAt).toLocaleString()}
          </p>
        ) : null}
      </form>

      {error ? (
        <div
          className="rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {warnings.join(' ')}
        </p>
      ) : null}

      {files.length === 0 && !loading && !error ? (
        <p className="text-sm text-teal-800 dark:text-teal-300">
          No markdown files in that folder.
        </p>
      ) : null}

      {files.length > 0 ? (
        <>
          <CallSheet corpus={corpus} when={when} />
          <nav
            className="flex flex-wrap gap-1"
            aria-label="Live pack sections"
          >
            {(
              [
                ['tonight', 'Tonight'],
                ['drill', 'Drill'],
                ['stories', 'Stories'],
                ['projects', 'Projects'],
                ['feedback', 'Feedback'],
                ['files', 'Files'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={
                  view === id
                    ? 'app-nav-link app-nav-link-active'
                    : 'app-nav-link'
                }
                aria-current={view === id ? 'page' : undefined}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          {view === 'tonight' ? (
            <TonightView corpus={corpus} onOpenDrill={openDrill} />
          ) : null}
          {view === 'drill' ? (
            <DrillView
              corpus={corpus}
              selectedId={drillId}
              onSelect={setDrillId}
              query={drillQuery}
              onQuery={setDrillQuery}
              filter={drillFilter}
              onFilter={setDrillFilter}
              rehearsed={rehearsed}
              onToggleRehearsed={toggleRehearsed}
            />
          ) : null}
          {view === 'stories' ? <StoriesView corpus={corpus} /> : null}
          {view === 'projects' ? <ProjectsView corpus={corpus} /> : null}
          {view === 'feedback' ? <FeedbackView corpus={corpus} /> : null}
          {view === 'files' ? <FilesView files={files} /> : null}
        </>
      ) : null}
    </div>
  )
}

function CallSheet({
  corpus,
  when,
}: {
  corpus: PrepCorpus
  when: string | null
}) {
  const { live, coaching, readiness } = corpus
  const company = live?.company ?? 'Next interview'
  const role = live?.role ?? coaching?.targetRole ?? ''
  const round = live?.round ?? coaching?.interviewLabel ?? ''
  return (
    <section className="overflow-hidden rounded-2xl border border-teal-900 bg-teal-950 text-teal-50 dark:border-teal-800">
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-300">
            Call sheet{when ? ` · ${when}` : ''}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{company}</h2>
          <p className="mt-1 text-sm text-teal-100/85">
            {[role, round].filter(Boolean).join(' · ')}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-teal-100/90">
            {readiness.headline}
          </p>
        </div>
        <div className="min-w-[11rem]">
          <p className="text-3xl font-semibold tabular-nums">{readiness.percent}%</p>
          <p className="text-xs text-teal-200/80">ready enough to walk in</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-900">
            <div
              className="h-full rounded-full bg-orange-400"
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-teal-100/85">
            <div>
              <dt className="text-teal-300/80">P0</dt>
              <dd className="tabular-nums">
                {readiness.p0Done}/{readiness.p0Total}
              </dd>
            </div>
            <div>
              <dt className="text-teal-300/80">Open facts</dt>
              <dd className="tabular-nums">{readiness.openFacts}</dd>
            </div>
            <div>
              <dt className="text-teal-300/80">Stories drafted</dt>
              <dd className="tabular-nums">
                {readiness.draftedStories}/{readiness.storyTotal}
              </dd>
            </div>
            <div>
              <dt className="text-teal-300/80">Pitch</dt>
              <dd>{readiness.pitch ?? '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function TonightView({
  corpus,
  onOpenDrill,
}: {
  corpus: PrepCorpus
  onOpenDrill: (id: string) => void
}) {
  const p0 = corpus.todo.filter((t) => t.priority === 'P0')
  const liveOpen = corpus.drill.filter((d) => d.source === 'live' && d.openGaps.length > 0)
  const pitchCard = corpus.drill.find((d) => d.tags.includes('pitch') || d.tags.includes('intro'))

  return (
    <div className="space-y-6">
      {corpus.corrections.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">Accuracy — keep on screen</h2>
          <ol className="mt-3 space-y-2">
            {corpus.corrections.slice(0, 7).map((c) => (
              <li key={c.n} className="text-sm leading-snug text-teal-950 dark:text-teal-50">
                <span className="mr-2 font-mono text-xs text-orange-700 dark:text-orange-300">
                  {c.n}
                </span>
                <span className="font-semibold">{c.title}.</span>{' '}
                <span className="text-teal-800/90 dark:text-teal-200/90">{c.body}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {corpus.focusItems.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">If you only do three things</h2>
          <ol className="mt-3 space-y-3">
            {corpus.focusItems.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-950 text-xs font-semibold text-teal-50 dark:bg-teal-700">
                  {i + 1}
                </span>
                <span className="text-teal-950 dark:text-teal-50">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="app-card">
        <h2 className="app-section-label">P0 before the call</h2>
        <ul className="mt-3 divide-y divide-teal-100 dark:divide-teal-900/50">
          {p0.length === 0 ? (
            <li className="py-3 text-sm text-teal-800 dark:text-teal-300">
              No P0 checklist parsed. Check `prep-todo.md`.
            </li>
          ) : (
            p0.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-teal-950 dark:text-teal-50">
                    {item.title}
                  </p>
                  {item.detail ? (
                    <p className="mt-1 text-xs leading-relaxed text-teal-800/90 dark:text-teal-300/90">
                      {item.detail}
                    </p>
                  ) : null}
                </div>
                <TodoBadge status={item.status} />
              </li>
            ))
          )}
        </ul>
      </section>

      {corpus.live?.beforeCall.length ? (
        <section className="app-card">
          <h2 className="app-section-label">Facts to retrieve</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-teal-950 dark:text-teal-50">
            {corpus.live.beforeCall.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {liveOpen.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">Answers still open</h2>
          <ul className="mt-3 space-y-2">
            {liveOpen.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-left text-sm hover:border-orange-300 dark:border-orange-900/60 dark:bg-orange-950/30"
                  onClick={() => onOpenDrill(d.id)}
                >
                  <span className="font-semibold text-orange-950 dark:text-orange-100">
                    {d.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-orange-900/80 dark:text-orange-200/80">
                    {d.openGaps[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pitchCard ? (
        <section className="app-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="app-section-label">Pitch</h2>
            <button
              type="button"
              className="app-btn-secondary"
              onClick={() => onOpenDrill(pitchCard.id)}
            >
              Open in drill
            </button>
          </div>
          <Spoken text={pitchCard.spoken} />
        </section>
      ) : null}

      {corpus.live?.tagIndex.length ? (
        <section className="app-card">
          <h2 className="app-section-label">If they ask about…</h2>
          <ul className="mt-3 divide-y divide-teal-100 dark:divide-teal-900/50">
            {corpus.live.tagIndex.map((row) => {
              const match = corpus.drill.find((d) =>
                row.tags.some((t) => d.tags.includes(t)),
              )
              return (
                <li key={row.ask} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm text-teal-950 dark:text-teal-50">{row.ask}</p>
                    <p className="font-mono text-[11px] text-teal-700 dark:text-teal-400">
                      {row.search || row.tags.map((t) => `#${t}`).join(' ')}
                    </p>
                  </div>
                  {match ? (
                    <button
                      type="button"
                      className="app-btn-secondary shrink-0"
                      onClick={() => onOpenDrill(match.id)}
                    >
                      Drill
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {corpus.vet.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">VET coverage</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {corpus.vet.map((v) => (
              <div
                key={v.name}
                className="rounded-lg border border-teal-100 px-3 py-2 dark:border-teal-900/50"
              >
                <p className="text-sm font-semibold text-teal-950 dark:text-teal-50">
                  {v.name}{' '}
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    {v.level}
                  </span>
                </p>
                {v.note ? (
                  <p className="mt-1 text-xs text-teal-800/90 dark:text-teal-300/90">{v.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function DrillView({
  corpus,
  selectedId,
  onSelect,
  query,
  onQuery,
  filter,
  onFilter,
  rehearsed,
  onToggleRehearsed,
}: {
  corpus: PrepCorpus
  selectedId: string | null
  onSelect: (id: string) => void
  query: string
  onQuery: (q: string) => void
  filter: 'all' | 'open' | 'live' | 'unrehearsed'
  onFilter: (f: 'all' | 'open' | 'live' | 'unrehearsed') => void
  rehearsed: Record<string, string>
  onToggleRehearsed: (id: string) => void
}) {
  const q = query.trim().toLowerCase()
  const cards = corpus.drill.filter((d) => {
    if (filter === 'open' && d.openGaps.length === 0) return false
    if (filter === 'live' && d.source !== 'live') return false
    if (filter === 'unrehearsed' && rehearsed[d.id]) return false
    if (!q) return true
    const hay = `${d.title} ${d.tags.join(' ')} ${d.spoken} ${d.notes}`.toLowerCase()
    return hay.includes(q)
  })
  const selected = cards.find((c) => c.id === selectedId) ?? cards[0] ?? null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      if (cards.length === 0) return
      const idx = selected ? cards.findIndex((c) => c.id === selected.id) : 0
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault()
        const next = cards[Math.min(cards.length - 1, idx + 1)]
        if (next) onSelect(next.id)
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = cards[Math.max(0, idx - 1)]
        if (prev) onSelect(prev.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cards, onSelect, selected])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_1fr]">
      <div className="space-y-3">
        <input
          className="app-field w-full"
          placeholder="Search tags or questions"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['all', 'All'],
              ['live', 'This call'],
              ['open', 'Open gaps'],
              ['unrehearsed', 'Not rehearsed'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                filter === id
                  ? 'app-btn-secondary border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500 dark:text-teal-950'
                  : 'app-btn-secondary'
              }
              onClick={() => onFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
          {cards.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onSelect(d.id)}
                className={`w-full cursor-pointer rounded-lg border px-2.5 py-2 text-left text-xs transition-colors duration-150 ${
                  selected?.id === d.id
                    ? 'border-teal-700 bg-teal-950 text-teal-50 dark:border-teal-500'
                    : 'border-teal-100 bg-white text-teal-950 hover:border-teal-300 dark:border-teal-900/50 dark:bg-zinc-900 dark:text-teal-50'
                }`}
              >
                <span className="block font-semibold leading-snug">{d.title}</span>
                <span
                  className={`mt-1 block font-mono ${selected?.id === d.id ? 'text-teal-200' : 'text-teal-700 dark:text-teal-400'}`}
                >
                  {d.tags.map((t) => `#${t}`).join(' ') || d.source}
                  {d.openGaps.length > 0 ? ' · open' : ''}
                  {rehearsed[d.id] ? ' · rehearsed' : ''}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-teal-700/80 dark:text-teal-400/85">
          j / k to move. {cards.length} card{cards.length === 1 ? '' : 's'}.
        </p>
      </div>
      <DrillDetail
        card={selected}
        rehearsed={selected ? Boolean(rehearsed[selected.id]) : false}
        onToggleRehearsed={onToggleRehearsed}
      />
    </div>
  )
}

function DrillDetail({
  card,
  rehearsed,
  onToggleRehearsed,
}: {
  card: DrillCard | null
  rehearsed: boolean
  onToggleRehearsed: (id: string) => void
}) {
  if (!card) {
    return (
      <div className="app-card text-sm text-teal-800 dark:text-teal-300">
        No cards match that filter.
      </div>
    )
  }
  return (
    <article className="app-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-[11px] text-teal-700 dark:text-teal-400">
            {card.tags.map((t) => `#${t}`).join(' ') || card.source}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-teal-950 dark:text-teal-50">
            {card.title}
          </h2>
        </div>
        <button
          type="button"
          className={rehearsed ? 'app-btn-primary' : 'app-btn-secondary'}
          onClick={() => onToggleRehearsed(card.id)}
        >
          {rehearsed ? 'Rehearsed' : 'Mark rehearsed'}
        </button>
      </div>
      <div>
        <h3 className="app-section-label">Say this</h3>
        <div className="mt-2">
          <Spoken text={card.spoken} />
        </div>
      </div>
      {card.openGaps.length > 0 ? (
        <div className="space-y-2">
          <h3 className="app-section-label">Open before the call</h3>
          {card.openGaps.map((g, i) => (
            <p
              key={i}
              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-950 dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-100"
            >
              {g}
            </p>
          ))}
        </div>
      ) : null}
      {card.notes ? (
        <div>
          <h3 className="app-section-label">Notes</h3>
          <div className="mt-2 max-h-[28rem] overflow-y-auto">
            <Prose text={card.notes} />
          </div>
        </div>
      ) : null}
    </article>
  )
}

function StoriesView({ corpus }: { corpus: PrepCorpus }) {
  return (
    <div className="space-y-4">
      {corpus.accuracyRules.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">Standing accuracy rules</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-teal-950 dark:text-teal-50">
            {corpus.accuracyRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {corpus.storyIndex.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">If asked… go to</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {corpus.storyIndex.map((row) => (
              <li
                key={row.ask}
                className="grid gap-1 sm:grid-cols-[1fr_1fr] sm:gap-4"
              >
                <span className="text-teal-800 dark:text-teal-300">{row.ask}</span>
                <span className="font-medium text-teal-950 dark:text-teal-50">
                  {row.goTo}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="space-y-4">
        {corpus.stories.map((s) => (
          <article key={s.id} className="app-card space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                {s.theme ? (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    {s.theme}
                  </p>
                ) : null}
                <h2 className="text-base font-semibold text-teal-950 dark:text-teal-50">
                  {s.title}
                </h2>
                {s.source ? (
                  <p className="mt-1 text-xs text-teal-700 dark:text-teal-400">{s.source}</p>
                ) : null}
              </div>
              <DraftBadge status={s.draftStatus} />
            </div>
            <dl className="space-y-2 text-sm">
              {s.situation ? (
                <div>
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Situation
                  </dt>
                  <dd>{s.situation}</dd>
                </div>
              ) : null}
              {s.task ? (
                <div>
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Task
                  </dt>
                  <dd>{s.task}</dd>
                </div>
              ) : null}
              {s.action ? (
                <div>
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Action
                  </dt>
                  <dd>{s.action}</dd>
                </div>
              ) : null}
              {s.result ? (
                <div>
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Result
                  </dt>
                  <dd>{s.result}</dd>
                </div>
              ) : null}
              {s.reflection ? (
                <div>
                  <dt className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Reflection
                  </dt>
                  <dd>{s.reflection}</dd>
                </div>
              ) : null}
            </dl>
            {s.bestFor ? (
              <p className="text-xs text-teal-800 dark:text-teal-300">
                Best for: {s.bestFor}
              </p>
            ) : null}
            {s.accuracyNotes.map((n) => (
              <p
                key={n}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
              >
                {n}
              </p>
            ))}
          </article>
        ))}
      </div>
    </div>
  )
}

function ProjectsView({ corpus }: { corpus: PrepCorpus }) {
  if (corpus.projects.length === 0) {
    return <p className="text-sm text-teal-800 dark:text-teal-300">No project sheet parsed.</p>
  }
  return (
    <div className="space-y-4">
      {corpus.projects.map((p) => (
        <article key={p.id} className="app-card space-y-3">
          <h2 className="text-base font-semibold text-teal-950 dark:text-teal-50">
            {p.title}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Fact label="What it is" text={p.what} />
            <Fact label="Who it was for" text={p.who} />
            <Fact label="Why it mattered" text={p.why} />
            <Fact label="My role" text={p.role} />
            <Fact label="Constraint" text={p.constraint} />
            <Fact label="Difficult" text={p.difficult} />
            <Fact label="Do differently" text={p.differently} />
            <Fact label="Status" text={p.status} />
          </div>
        </article>
      ))}
    </div>
  )
}

function Fact({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <div>
      <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-teal-950 dark:text-teal-50">{text}</p>
    </div>
  )
}

function FeedbackView({ corpus }: { corpus: PrepCorpus }) {
  return (
    <div className="space-y-4">
      {corpus.corrections.length > 0 ? (
        <section className="app-card">
          <h2 className="app-section-label">Active corrections</h2>
          <ol className="mt-3 space-y-3">
            {corpus.corrections.map((c) => (
              <li key={c.n} className="text-sm leading-relaxed">
                <span className="font-semibold text-teal-950 dark:text-teal-50">
                  {c.n}. {c.title}.
                </span>{' '}
                <span className="text-teal-800 dark:text-teal-200">{c.body}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
      {corpus.feedback.map((s) => (
        <details key={s.title} className="app-card">
          <summary className="cursor-pointer text-sm font-semibold text-teal-950 dark:text-teal-50">
            {s.title}
          </summary>
          <div className="mt-3">
            <Prose text={s.body} />
          </div>
        </details>
      ))}
    </div>
  )
}

function FilesView({ files }: { files: PrepFile[] }) {
  const [open, setOpen] = useState<string | null>(files[0]?.name ?? null)
  const current = files.find((f) => f.name === open) ?? null
  return (
    <div className="grid gap-4 lg:grid-cols-[14rem_1fr]">
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f.name}>
            <button
              type="button"
              className={`w-full cursor-pointer rounded-lg px-2 py-1.5 text-left font-mono text-xs ${
                open === f.name
                  ? 'bg-teal-950 text-teal-50'
                  : 'text-teal-900 hover:bg-teal-100 dark:text-teal-100 dark:hover:bg-teal-950/60'
              }`}
              onClick={() => setOpen(f.name)}
            >
              {f.name}
            </button>
          </li>
        ))}
      </ul>
      {current ? (
        <pre className="app-card max-h-[70vh] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-teal-950 dark:text-teal-100">
          {current.content}
        </pre>
      ) : null}
    </div>
  )
}
