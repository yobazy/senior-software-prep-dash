export const STORAGE_KEY = 'interview-prep-v1'

export type StoryStatus = 'not_practiced' | 'needs_work' | 'confident'
export type SystemStatus = 'not_started' | 'studied' | 'confident'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface StoryCard {
  id: string
  title: string
  context: string
  star: string
  status: StoryStatus
  practiceCount: number
  /** Local calendar day (YYYY-MM-DD) of last logged practice, or null */
  lastPracticedDay: string | null
  notes: string
}

export interface LinkItem {
  id: string
  label: string
  url: string
}

export interface CodingProblem {
  id: string
  pattern: string
  title: string
  /** If set, used for leetcode.com/problems/{slug}/ instead of title-based slug. */
  lcSlug?: string
  lcNumber: number
  difficulty: Difficulty
  /** Same scale as story cards: not practiced → needs work → confident */
  confidence: StoryStatus
  practiceCount: number
  /** Local calendar day (YYYY-MM-DD) of last logged practice, or null */
  lastPracticedDay: string | null
  notes: string
}

export interface SystemTopic {
  id: string
  title: string
  status: SystemStatus
  notes: string
}

export interface SessionEntry {
  id: string
  text: string
  createdAt: string
}

export type PracticeTrack =
  | 'story'
  | 'coding'
  | 'system'
  | 'system_checklist'

/** Auto-captured when you change a status pill or check a system-design task. */
export interface PracticeEvent {
  id: string
  at: string
  track: PracticeTrack
  /** Card title, problem title, topic title, or checklist task label */
  label: string
  /** e.g. status transition */
  detail?: string
}

export interface AppData {
  positioningStatement: string
  storyCards: StoryCard[]
  storyLinks: LinkItem[]
  codingProblems: CodingProblem[]
  systemTopics: SystemTopic[]
  systemResources: LinkItem[]
  /** Stable task ids from the system design checklist (System design tab). */
  systemChecklistDone: string[]
  /** Legacy manual notes; still counts toward streak if present. */
  sessionLog: SessionEntry[]
  practiceEvents: PracticeEvent[]
  darkMode: boolean
}
