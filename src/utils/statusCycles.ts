import type { CodingStatus, StoryStatus, SystemStatus } from '../types'

export function cycleStory(s: StoryStatus): StoryStatus {
  if (s === 'not_practiced') return 'needs_work'
  if (s === 'needs_work') return 'confident'
  return 'not_practiced'
}

export function cycleCoding(s: CodingStatus): CodingStatus {
  if (s === 'not_started') return 'attempted'
  if (s === 'attempted') return 'solved'
  return 'not_started'
}

export function cycleSystem(s: SystemStatus): SystemStatus {
  if (s === 'not_started') return 'studied'
  if (s === 'studied') return 'confident'
  return 'not_started'
}
