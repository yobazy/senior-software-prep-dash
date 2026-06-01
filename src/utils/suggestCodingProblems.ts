import type { CodingProblem, Difficulty } from '../types'
import { compareTopicPatterns } from './codingTopicOrder'

export type SuggestionReason = 'up_next' | 'review' | 'fill'

export type CodingSuggestion = {
  problem: CodingProblem
  reason: SuggestionReason
}

function difficultyRank(d: Difficulty): number {
  if (d === 'Easy') return 0
  if (d === 'Medium') return 1
  return 2
}

/** NeetCode roadmap order: topic → easy/hard → LC #. */
export function compareCodingRoadmapOrder(
  a: CodingProblem,
  b: CodingProblem,
): number {
  const tp = compareTopicPatterns(a.pattern, b.pattern)
  if (tp !== 0) return tp
  const rd = difficultyRank(a.difficulty) - difficultyRank(b.difficulty)
  if (rd !== 0) return rd
  return a.lcNumber - b.lcNumber
}

function compareStaleReview(a: CodingProblem, b: CodingProblem): number {
  if (a.lastPracticedDay === null && b.lastPracticedDay !== null) return -1
  if (a.lastPracticedDay !== null && b.lastPracticedDay === null) return 1
  if (
    a.lastPracticedDay !== null &&
    b.lastPracticedDay !== null &&
    a.lastPracticedDay !== b.lastPracticedDay
  ) {
    return a.lastPracticedDay.localeCompare(b.lastPracticedDay)
  }
  if (a.practiceCount !== b.practiceCount) {
    return a.practiceCount - b.practiceCount
  }
  return compareCodingRoadmapOrder(a, b)
}

export function codingProblemListId(problemId: string): string {
  return `coding-problem-${problemId}`
}

/**
 * Blend: one up-next (first not practiced in roadmap order), up to two stale
 * needs-work reviews, then fill with more not practiced until `limit`.
 */
export function suggestCodingProblems(
  problems: CodingProblem[],
  limit = 3,
): CodingSuggestion[] {
  const sorted = [...problems].sort(compareCodingRoadmapOrder)
  const picked: CodingSuggestion[] = []
  const seen = new Set<string>()

  function add(problem: CodingProblem, reason: SuggestionReason) {
    if (picked.length >= limit || seen.has(problem.id)) return
    seen.add(problem.id)
    picked.push({ problem, reason })
  }

  const upNext = sorted.find((p) => p.confidence === 'not_practiced')
  if (upNext) add(upNext, 'up_next')

  const reviews = sorted
    .filter((p) => p.confidence === 'needs_work')
    .sort(compareStaleReview)
  let reviewCount = 0
  for (const p of reviews) {
    if (picked.length >= limit || reviewCount >= 2) break
    if (!seen.has(p.id)) {
      add(p, 'review')
      reviewCount++
    }
  }

  for (const p of sorted) {
    if (picked.length >= limit) break
    if (p.confidence === 'not_practiced') add(p, 'fill')
  }

  return picked
}
