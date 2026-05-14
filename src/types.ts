export const STORAGE_KEY = 'interview-prep-v1'

export type StoryStatus = 'not_practiced' | 'needs_work' | 'confident'
export type CodingStatus = 'not_started' | 'attempted' | 'solved'
export type SystemStatus = 'not_started' | 'studied' | 'confident'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface StoryCard {
  id: string
  title: string
  context: string
  star: string
  status: StoryStatus
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
  status: CodingStatus
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

export interface AppData {
  positioningStatement: string
  storyCards: StoryCard[]
  storyLinks: LinkItem[]
  codingProblems: CodingProblem[]
  systemTopics: SystemTopic[]
  systemResources: LinkItem[]
  /** Stable task ids from the system design checklist (System design tab). */
  systemChecklistDone: string[]
  sessionLog: SessionEntry[]
  darkMode: boolean
}
