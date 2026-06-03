import type { CodingConfidence, StoryStatus, SystemStatus } from '../types'

/** Full credit when you are confident you can deliver in an interview. */
const CONFIDENT_WEIGHT = 1
/** Partial credit for practiced / studied but not yet confident. */
const PARTIAL_WEIGHT = 0.5
/** Strong partial credit — close to interview-ready. */
const ALMOST_THERE_WEIGHT = 0.75

export function storyStatusWeight(status: StoryStatus): number {
  if (status === 'confident') return CONFIDENT_WEIGHT
  if (status === 'needs_work') return PARTIAL_WEIGHT
  return 0
}

export function codingConfidenceWeight(status: CodingConfidence): number {
  if (status === 'confident') return CONFIDENT_WEIGHT
  if (status === 'almost_there') return ALMOST_THERE_WEIGHT
  if (status === 'needs_work') return PARTIAL_WEIGHT
  return 0
}

export function systemStatusWeight(status: SystemStatus): number {
  if (status === 'confident') return CONFIDENT_WEIGHT
  if (status === 'studied') return PARTIAL_WEIGHT
  return 0
}

export function weightedReadinessPct(scoreSum: number, total: number): number {
  if (total === 0) return 0
  return Math.round((scoreSum / total) * 100)
}
