import type { CodingConfidence, StoryStatus, SystemStatus } from '../types'

export function cycleStory(s: StoryStatus): StoryStatus {
  if (s === 'not_practiced') return 'needs_work'
  if (s === 'needs_work') return 'confident'
  return 'not_practiced'
}

export function cycleCoding(s: CodingConfidence): CodingConfidence {
  if (s === 'not_practiced') return 'needs_work'
  if (s === 'needs_work') return 'almost_there'
  if (s === 'almost_there') return 'confident'
  return 'not_practiced'
}

/**
 * Cycle Not started → Studied → Confident → Not started.
 * Pass `canConfident: false` to block Studied → Confident (caller should keep Studied).
 */
export function cycleSystem(
  s: SystemStatus,
  opts?: { canConfident?: boolean },
): SystemStatus | 'blocked_confident' {
  if (s === 'not_started') return 'studied'
  if (s === 'studied') {
    if (opts?.canConfident === false) return 'blocked_confident'
    return 'confident'
  }
  return 'not_started'
}
