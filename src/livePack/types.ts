export type TodoStatus = 'open' | 'doing' | 'done'
export type DraftStatus = 'drafted' | 'outlined' | 'empty' | 'probing'

export interface PrepFile {
  name: string
  content: string
  mtimeMs: number
  bytes: number
}

export interface TodoItem {
  id: string
  status: TodoStatus
  title: string
  detail: string
  priority: string
  section: string
}

export interface StoryCard {
  id: string
  theme: string
  title: string
  source: string
  situation: string
  task: string
  action: string
  result: string
  reflection: string
  bestFor: string
  accuracyNotes: string[]
  draftStatus?: DraftStatus
}

export interface StoryIndexRow {
  ask: string
  goTo: string
}

export interface AnswerStory {
  id: string
  code: string
  title: string
  tags: string[]
  status: DraftStatus
  statusNote: string
  spoken: string
  body: string
}

export interface AnswerQuestion {
  id: string
  code: string
  title: string
  tags: string[]
  status: DraftStatus
  spoken: string
  body: string
}

export interface DrillCard {
  id: string
  source: 'live' | 'bank'
  tags: string[]
  title: string
  spoken: string
  notes: string
  openGaps: string[]
}

export interface ProjectCard {
  id: string
  title: string
  what: string
  who: string
  why: string
  role: string
  constraint: string
  difficult: string
  differently: string
  status: string
  extras: { label: string; value: string }[]
}

export interface Correction {
  n: number
  title: string
  body: string
}

export interface FeedbackBlock {
  title: string
  body: string
}

export interface TagIndexRow {
  ask: string
  tags: string[]
  search: string
}

export interface LivePackMeta {
  company: string
  role: string
  round: string
  whyCompany: string
  rules: string[]
  tagIndex: TagIndexRow[]
  beforeCall: string[]
}

export interface CoachingSnapshot {
  targetRole: string
  interviewDate: string | null
  interviewLabel: string
  mode: string
  bottleneck: string
  concern: string
}

export interface VetTrait {
  name: string
  level: string
  note: string
}

export interface Readiness {
  percent: number
  p0Done: number
  p0Total: number
  openFacts: number
  draftedStories: number
  storyTotal: number
  pitch: string | null
  headline: string
}

export interface PrepCorpus {
  files: PrepFile[]
  todo: TodoItem[]
  focusItems: string[]
  stories: StoryCard[]
  storyIndex: StoryIndexRow[]
  accuracyRules: string[]
  answerStories: AnswerStory[]
  answerQuestions: AnswerQuestion[]
  vet: VetTrait[]
  drill: DrillCard[]
  projects: ProjectCard[]
  corrections: Correction[]
  feedback: FeedbackBlock[]
  live: LivePackMeta | null
  coaching: CoachingSnapshot | null
  readiness: Readiness
}

export type PrepFileKind =
  | 'todo'
  | 'stories'
  | 'answers'
  | 'projects'
  | 'feedback'
  | 'coaching'
  | 'live'
  | 'other'
