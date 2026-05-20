import type { StoryStatus, SystemStatus } from '../types'

export function labelStoryStatus(s: StoryStatus): string {
  if (s === 'not_practiced') return 'Not practiced'
  if (s === 'needs_work') return 'Needs work'
  return 'Confident'
}

export function labelSystemStatus(s: SystemStatus): string {
  if (s === 'not_started') return 'Not started'
  if (s === 'studied') return 'Studied'
  return 'Confident'
}
