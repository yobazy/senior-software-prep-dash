import type { CodingProblem } from '../types'

/** Best-effort LeetCode problem URL from title (matches common slug patterns). */
export function leetCodeProblemUrl(problem: Pick<CodingProblem, 'title' | 'lcSlug'>): string {
  const slug =
    problem.lcSlug?.trim() ||
    problem.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  return `https://leetcode.com/problems/${slug}/`
}
