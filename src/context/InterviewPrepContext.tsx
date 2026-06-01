import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createDefaultData } from '../defaults'
import { SYSTEM_CHECKLIST_TASK_LABELS } from '../data/systemDesignChecklist'
import { normalizeCodingProblems } from '../utils/codingProblemNormalize'
import { mergeNeetCode150 } from '../utils/mergeNeetCode150'
import { normalizeStoryCards } from '../utils/storyCardNormalize'
import { normalizeSystemTopics } from '../utils/systemTopicNormalize'
import {
  STORAGE_KEY,
  type AppData,
  type CodingProblem,
  type LinkItem,
  type PracticeEvent,
  type StoryCard,
  type SystemTopic,
} from '../types'
import {
  labelStoryStatus,
  labelSystemStatus,
} from '../utils/practiceStatusLabels'
import {
  storyStatusWeight,
  systemStatusWeight,
  weightedReadinessPct,
} from '../utils/readinessScore'

type InterviewPrepContextValue = {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  updatePositioning: (value: string) => void
  setDarkMode: (value: boolean) => void
  updateStoryCard: (id: string, patch: Partial<StoryCard>) => void
  deleteStoryCard: (id: string) => void
  addStoryCard: (card: Omit<StoryCard, 'id'>) => void
  addStoryLink: (label: string, url: string) => void
  deleteStoryLink: (id: string) => void
  updateCodingProblem: (id: string, patch: Partial<CodingProblem>) => void
  deleteCodingProblem: (id: string) => void
  addCodingProblem: (
    p: Pick<CodingProblem, 'title' | 'lcNumber' | 'pattern' | 'difficulty'> &
      Partial<Pick<CodingProblem, 'lcSlug' | 'confidence' | 'practiceCount' | 'lastPracticedDay'>>,
  ) => void
  updateSystemTopic: (id: string, patch: Partial<SystemTopic>) => void
  deleteSystemTopic: (id: string) => void
  addSystemTopic: (title: string) => void
  addSystemResource: (label: string, url: string) => void
  deleteSystemResource: (id: string) => void
  toggleSystemChecklistTask: (taskId: string) => void
  readiness: {
    story: number
    coding: number
    systemDesign: number
  }
}

const InterviewPrepContext = createContext<InterviewPrepContextValue | null>(
  null,
)

function loadStored(): AppData {
  const base = createDefaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const p = JSON.parse(raw) as Partial<AppData>
    if (!p || typeof p !== 'object') return base
    return {
      ...base,
      ...p,
      positioningStatement:
        typeof p.positioningStatement === 'string'
          ? p.positioningStatement
          : base.positioningStatement,
      darkMode:
        typeof p.darkMode === 'boolean' ? p.darkMode : base.darkMode,
      storyCards: normalizeStoryCards(p.storyCards, base.storyCards),
      storyLinks: Array.isArray(p.storyLinks) ? p.storyLinks : base.storyLinks,
      codingProblems: mergeNeetCode150(
        normalizeCodingProblems(p.codingProblems, []),
        base.codingProblems,
      ),
      systemTopics: normalizeSystemTopics(p.systemTopics, base.systemTopics),
      systemResources: Array.isArray(p.systemResources)
        ? p.systemResources
        : base.systemResources,
      systemChecklistDone: Array.isArray(p.systemChecklistDone)
        ? p.systemChecklistDone.filter((x): x is string => typeof x === 'string')
        : base.systemChecklistDone,
      sessionLog: Array.isArray(p.sessionLog) ? p.sessionLog : base.sessionLog,
      practiceEvents: Array.isArray(p.practiceEvents)
        ? p.practiceEvents.filter(
            (e): e is PracticeEvent =>
              e &&
              typeof e === 'object' &&
              typeof (e as PracticeEvent).id === 'string' &&
              typeof (e as PracticeEvent).at === 'string' &&
              typeof (e as PracticeEvent).track === 'string' &&
              typeof (e as PracticeEvent).label === 'string',
          )
        : base.practiceEvents,
    }
  } catch {
    return base
  }
}

export function InterviewPrepProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadStored())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data.darkMode)
  }, [data.darkMode])

  const updatePositioning = useCallback((value: string) => {
    setData((d) => ({ ...d, positioningStatement: value }))
  }, [])

  const setDarkMode = useCallback((value: boolean) => {
    setData((d) => ({ ...d, darkMode: value }))
  }, [])

  const updateStoryCard = useCallback((id: string, patch: Partial<StoryCard>) => {
    setData((d) => {
      const prev = d.storyCards.find((c) => c.id === id)
      const storyCards = d.storyCards.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      )
      if (!prev) {
        return { ...d, storyCards }
      }
      const merged = storyCards.find((c) => c.id === id)!
      const newEvents: PracticeEvent[] = []

      if (patch.status !== undefined && patch.status !== prev.status) {
        newEvents.push({
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          track: 'story',
          label: merged.title.trim() || 'Story card',
          detail: `${labelStoryStatus(prev.status)} → ${labelStoryStatus(patch.status)}`,
        })
      }

      if (
        patch.practiceCount !== undefined &&
        patch.practiceCount > prev.practiceCount
      ) {
        newEvents.push({
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          track: 'story',
          label: merged.title.trim() || 'Story card',
          detail: `Practice logged (×${patch.practiceCount} total)`,
        })
      }

      if (newEvents.length === 0) {
        return { ...d, storyCards }
      }
      return {
        ...d,
        storyCards,
        practiceEvents: [...newEvents, ...(d.practiceEvents ?? [])].slice(0, 500),
      }
    })
  }, [])

  const deleteStoryCard = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      storyCards: d.storyCards.filter((c) => c.id !== id),
    }))
  }, [])

  const addStoryCard = useCallback((card: Omit<StoryCard, 'id'>) => {
    setData((d) => ({
      ...d,
      storyCards: [
        ...d.storyCards,
        {
          ...card,
          id: crypto.randomUUID(),
          practiceCount: card.practiceCount ?? 0,
          lastPracticedDay: card.lastPracticedDay ?? null,
        },
      ],
    }))
  }, [])

  const addStoryLink = useCallback((label: string, url: string) => {
    const item: LinkItem = {
      id: crypto.randomUUID(),
      label: label.trim() || 'Link',
      url: url.trim() || 'https://',
    }
    setData((d) => ({ ...d, storyLinks: [...d.storyLinks, item] }))
  }, [])

  const deleteStoryLink = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      storyLinks: d.storyLinks.filter((l) => l.id !== id),
    }))
  }, [])

  const updateCodingProblem = useCallback(
    (id: string, patch: Partial<CodingProblem>) => {
      setData((d) => {
        const prev = d.codingProblems.find((p) => p.id === id)
        const codingProblems = d.codingProblems.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        )
        if (!prev) {
          return { ...d, codingProblems }
        }
        const merged = codingProblems.find((p) => p.id === id)!
        const newEvents: PracticeEvent[] = []

        if (
          patch.confidence !== undefined &&
          patch.confidence !== prev.confidence
        ) {
          newEvents.push({
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            track: 'coding',
            label: merged.title.trim() || 'Coding problem',
            detail: `${labelStoryStatus(prev.confidence)} → ${labelStoryStatus(patch.confidence)}`,
          })
        }

        if (
          patch.practiceCount !== undefined &&
          patch.practiceCount > prev.practiceCount
        ) {
          newEvents.push({
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            track: 'coding',
            label: merged.title.trim() || 'Coding problem',
            detail: `Practice logged (×${patch.practiceCount} total)`,
          })
        }

        if (newEvents.length === 0) {
          return { ...d, codingProblems }
        }
        return {
          ...d,
          codingProblems,
          practiceEvents: [...newEvents, ...(d.practiceEvents ?? [])].slice(
            0,
            500,
          ),
        }
      })
    },
    [],
  )

  const deleteCodingProblem = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      codingProblems: d.codingProblems.filter((p) => p.id !== id),
    }))
  }, [])

  const addCodingProblem = useCallback(
    (
      p: Pick<CodingProblem, 'title' | 'lcNumber' | 'pattern' | 'difficulty'> &
        Partial<
          Pick<CodingProblem, 'lcSlug' | 'confidence' | 'practiceCount' | 'lastPracticedDay'>
        >,
    ) => {
      const problem: CodingProblem = {
        ...p,
        id: crypto.randomUUID(),
        notes: '',
        confidence: p.confidence ?? 'not_practiced',
        practiceCount: p.practiceCount ?? 0,
        lastPracticedDay: p.lastPracticedDay ?? null,
      }
      setData((d) => ({
        ...d,
        codingProblems: [...d.codingProblems, problem],
      }))
    },
    [],
  )

  const updateSystemTopic = useCallback(
    (id: string, patch: Partial<SystemTopic>) => {
      setData((d) => {
        const prev = d.systemTopics.find((t) => t.id === id)
        const systemTopics = d.systemTopics.map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        )
        if (!prev) {
          return { ...d, systemTopics }
        }
        const merged = systemTopics.find((t) => t.id === id)!
        const newEvents: PracticeEvent[] = []

        if (patch.status !== undefined && patch.status !== prev.status) {
          newEvents.push({
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            track: 'system',
            label: merged.title.trim() || 'System design topic',
            detail: `${labelSystemStatus(prev.status)} → ${labelSystemStatus(patch.status)}`,
          })
        }

        if (
          patch.practiceCount !== undefined &&
          patch.practiceCount > prev.practiceCount
        ) {
          newEvents.push({
            id: crypto.randomUUID(),
            at: new Date().toISOString(),
            track: 'system',
            label: merged.title.trim() || 'System design topic',
            detail: `Practice logged (×${patch.practiceCount} total)`,
          })
        }

        if (newEvents.length === 0) {
          return { ...d, systemTopics }
        }
        return {
          ...d,
          systemTopics,
          practiceEvents: [...newEvents, ...(d.practiceEvents ?? [])].slice(
            0,
            500,
          ),
        }
      })
    },
    [],
  )

  const deleteSystemTopic = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      systemTopics: d.systemTopics.filter((t) => t.id !== id),
    }))
  }, [])

  const addSystemTopic = useCallback((title: string) => {
    const t = title.trim()
    if (!t) return
    setData((d) => ({
      ...d,
      systemTopics: [
        ...d.systemTopics,
        {
          id: crypto.randomUUID(),
          title: t,
          status: 'not_started',
          notes: '',
          practiceCount: 0,
          lastPracticedDay: null,
        },
      ],
    }))
  }, [])

  const addSystemResource = useCallback((label: string, url: string) => {
    const item: LinkItem = {
      id: crypto.randomUUID(),
      label: label.trim() || 'Resource',
      url: url.trim() || 'https://',
    }
    setData((d) => ({
      ...d,
      systemResources: [...d.systemResources, item],
    }))
  }, [])

  const deleteSystemResource = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      systemResources: d.systemResources.filter((r) => r.id !== id),
    }))
  }, [])

  const toggleSystemChecklistTask = useCallback((taskId: string) => {
    setData((d) => {
      const done = d.systemChecklistDone ?? []
      const has = done.includes(taskId)
      const systemChecklistDone = has
        ? done.filter((x) => x !== taskId)
        : [...done, taskId]
      if (has) {
        return { ...d, systemChecklistDone }
      }
      const label =
        SYSTEM_CHECKLIST_TASK_LABELS[taskId] ?? `Checklist task (${taskId})`
      const entry: PracticeEvent = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        track: 'system_checklist',
        label,
        detail: 'Checklist completed',
      }
      return {
        ...d,
        systemChecklistDone,
        practiceEvents: [entry, ...(d.practiceEvents ?? [])].slice(0, 500),
      }
    })
  }, [])

  const readiness = useMemo(() => {
    const storyTotal = data.storyCards.length
    const storyScore = data.storyCards.reduce(
      (sum, c) => sum + storyStatusWeight(c.status),
      0,
    )
    const codingTotal = data.codingProblems.length
    const codingScore = data.codingProblems.reduce(
      (sum, p) => sum + storyStatusWeight(p.confidence),
      0,
    )
    const sysTotal = data.systemTopics.length
    const sysScore = data.systemTopics.reduce(
      (sum, t) => sum + systemStatusWeight(t.status),
      0,
    )
    return {
      story: weightedReadinessPct(storyScore, storyTotal),
      coding: weightedReadinessPct(codingScore, codingTotal),
      systemDesign: weightedReadinessPct(sysScore, sysTotal),
    }
  }, [data.storyCards, data.codingProblems, data.systemTopics])

  const value = useMemo(
    () => ({
      data,
      setData,
      updatePositioning,
      setDarkMode,
      updateStoryCard,
      deleteStoryCard,
      addStoryCard,
      addStoryLink,
      deleteStoryLink,
      updateCodingProblem,
      deleteCodingProblem,
      addCodingProblem,
      updateSystemTopic,
      deleteSystemTopic,
      addSystemTopic,
      addSystemResource,
      deleteSystemResource,
      toggleSystemChecklistTask,
      readiness,
    }),
    [
      data,
      updatePositioning,
      setDarkMode,
      updateStoryCard,
      deleteStoryCard,
      addStoryCard,
      addStoryLink,
      deleteStoryLink,
      updateCodingProblem,
      deleteCodingProblem,
      addCodingProblem,
      updateSystemTopic,
      deleteSystemTopic,
      addSystemTopic,
      addSystemResource,
      deleteSystemResource,
      toggleSystemChecklistTask,
      readiness,
    ],
  )

  return (
    <InterviewPrepContext.Provider value={value}>
      {children}
    </InterviewPrepContext.Provider>
  )
}

export function useInterviewPrep() {
  const ctx = useContext(InterviewPrepContext)
  if (!ctx) {
    throw new Error('useInterviewPrep must be used within InterviewPrepProvider')
  }
  return ctx
}
