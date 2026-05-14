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
import { STORAGE_KEY, type AppData, type CodingProblem, type LinkItem, type SessionEntry, type StoryCard, type SystemTopic } from '../types'

type InterviewPrepContextValue = {
  data: AppData
  setData: React.Dispatch<React.SetStateAction<AppData>>
  updatePositioning: (value: string) => void
  setDarkMode: (value: boolean) => void
  addSession: (text: string) => void
  updateStoryCard: (id: string, patch: Partial<StoryCard>) => void
  deleteStoryCard: (id: string) => void
  addStoryCard: (card: Omit<StoryCard, 'id'>) => void
  addStoryLink: (label: string, url: string) => void
  deleteStoryLink: (id: string) => void
  updateCodingProblem: (id: string, patch: Partial<CodingProblem>) => void
  deleteCodingProblem: (id: string) => void
  addCodingProblem: (p: Omit<CodingProblem, 'id' | 'status' | 'notes'>) => void
  updateSystemTopic: (id: string, patch: Partial<SystemTopic>) => void
  deleteSystemTopic: (id: string) => void
  addSystemTopic: (title: string) => void
  addSystemResource: (label: string, url: string) => void
  deleteSystemResource: (id: string) => void
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
      storyCards: Array.isArray(p.storyCards) ? p.storyCards : base.storyCards,
      storyLinks: Array.isArray(p.storyLinks) ? p.storyLinks : base.storyLinks,
      codingProblems: Array.isArray(p.codingProblems)
        ? p.codingProblems
        : base.codingProblems,
      systemTopics: Array.isArray(p.systemTopics)
        ? p.systemTopics
        : base.systemTopics,
      systemResources: Array.isArray(p.systemResources)
        ? p.systemResources
        : base.systemResources,
      sessionLog: Array.isArray(p.sessionLog) ? p.sessionLog : base.sessionLog,
    }
  } catch {
    return base
  }
}

function pct(confident: number, total: number): number {
  if (total === 0) return 0
  return Math.round((confident / total) * 100)
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

  const addSession = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const entry: SessionEntry = {
      id: crypto.randomUUID(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    setData((d) => ({
      ...d,
      sessionLog: [entry, ...d.sessionLog].slice(0, 500),
    }))
  }, [])

  const updateStoryCard = useCallback((id: string, patch: Partial<StoryCard>) => {
    setData((d) => ({
      ...d,
      storyCards: d.storyCards.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }))
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
        { ...card, id: crypto.randomUUID() },
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
      setData((d) => ({
        ...d,
        codingProblems: d.codingProblems.map((p) =>
          p.id === id ? { ...p, ...patch } : p,
        ),
      }))
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
    (p: Omit<CodingProblem, 'id' | 'status' | 'notes'>) => {
      const problem: CodingProblem = {
        ...p,
        id: crypto.randomUUID(),
        status: 'not_started',
        notes: '',
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
      setData((d) => ({
        ...d,
        systemTopics: d.systemTopics.map((t) =>
          t.id === id ? { ...t, ...patch } : t,
        ),
      }))
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

  const readiness = useMemo(() => {
    const storyTotal = data.storyCards.length
    const storyConfident = data.storyCards.filter(
      (c) => c.status === 'confident',
    ).length
    const codingTotal = data.codingProblems.length
    const codingSolved = data.codingProblems.filter(
      (p) => p.status === 'solved',
    ).length
    const sysTotal = data.systemTopics.length
    const sysConfident = data.systemTopics.filter(
      (t) => t.status === 'confident',
    ).length
    return {
      story: pct(storyConfident, storyTotal),
      coding: pct(codingSolved, codingTotal),
      systemDesign: pct(sysConfident, sysTotal),
    }
  }, [data.storyCards, data.codingProblems, data.systemTopics])

  const value = useMemo(
    () => ({
      data,
      setData,
      updatePositioning,
      setDarkMode,
      addSession,
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
      readiness,
    }),
    [
      data,
      updatePositioning,
      setDarkMode,
      addSession,
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
