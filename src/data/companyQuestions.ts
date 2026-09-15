import type { CodingProblem, Difficulty } from '../types'
import { neetCodeCatalogId } from '../utils/mergeNeetCode150'

export const CODING_COMPANIES = ['DoorDash', 'Ripple'] as const
export type CodingCompany = (typeof CODING_COMPANIES)[number]

export type CompanyQuestionSeed = {
  company: CodingCompany
  lcNumber: number
  title: string
  difficulty: Difficulty
  lcSlug: string
  /** Share of recent interviews that asked this problem (0–100). */
  frequency: number
  /** Required when the problem is not already in the NeetCode / Clio catalog. */
  pattern?: string
}

/** DoorDash + Ripple lists from snehasishroy/leetcode-companywise-interview-questions (all.csv, Jul 2026). */
export const COMPANY_QUESTION_SEEDS: CompanyQuestionSeed[] = [
  // DoorDash
  { company: 'DoorDash', lcNumber: 1, title: 'Two Sum', difficulty: 'Easy', lcSlug: 'two-sum', frequency: 50 },
  { company: 'DoorDash', lcNumber: 986, title: 'Interval List Intersections', difficulty: 'Medium', lcSlug: 'interval-list-intersections', frequency: 50, pattern: 'Intervals' },
  { company: 'DoorDash', lcNumber: 987, title: 'Vertical Order Traversal of a Binary Tree', difficulty: 'Hard', lcSlug: 'vertical-order-traversal-of-a-binary-tree', frequency: 50, pattern: 'Trees' },
  { company: 'DoorDash', lcNumber: 31, title: 'Next Permutation', difficulty: 'Medium', lcSlug: 'next-permutation', frequency: 50, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 37, title: 'Sudoku Solver', difficulty: 'Hard', lcSlug: 'sudoku-solver', frequency: 37.5, pattern: 'Backtracking' },
  { company: 'DoorDash', lcNumber: 45, title: 'Jump Game II', difficulty: 'Medium', lcSlug: 'jump-game-ii', frequency: 25 },
  { company: 'DoorDash', lcNumber: 55, title: 'Jump Game', difficulty: 'Medium', lcSlug: 'jump-game', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', lcSlug: 'largest-rectangle-in-histogram', frequency: 50 },
  { company: 'DoorDash', lcNumber: 1166, title: 'Design File System', difficulty: 'Medium', lcSlug: 'design-file-system', frequency: 75, pattern: 'Design' },
  { company: 'DoorDash', lcNumber: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', lcSlug: 'binary-tree-maximum-path-sum', frequency: 87.5 },
  { company: 'DoorDash', lcNumber: 2049, title: 'Count Nodes With the Highest Score', difficulty: 'Medium', lcSlug: 'count-nodes-with-the-highest-score', frequency: 62.5, pattern: 'Trees' },
  { company: 'DoorDash', lcNumber: 2065, title: 'Maximum Path Quality of a Graph', difficulty: 'Hard', lcSlug: 'maximum-path-quality-of-a-graph', frequency: 25, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 146, title: 'LRU Cache', difficulty: 'Medium', lcSlug: 'lru-cache', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 200, title: 'Number of Islands', difficulty: 'Medium', lcSlug: 'number-of-islands', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 208, title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', lcSlug: 'implement-trie-prefix-tree', frequency: 50 },
  { company: 'DoorDash', lcNumber: 210, title: 'Course Schedule II', difficulty: 'Medium', lcSlug: 'course-schedule-ii', frequency: 50 },
  { company: 'DoorDash', lcNumber: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', lcSlug: 'design-add-and-search-words-data-structure', frequency: 25 },
  { company: 'DoorDash', lcNumber: 212, title: 'Word Search II', difficulty: 'Hard', lcSlug: 'word-search-ii', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 224, title: 'Basic Calculator', difficulty: 'Hard', lcSlug: 'basic-calculator', frequency: 50, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium', lcSlug: 'longest-common-subsequence', frequency: 50 },
  { company: 'DoorDash', lcNumber: 227, title: 'Basic Calculator II', difficulty: 'Medium', lcSlug: 'basic-calculator-ii', frequency: 50, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', lcSlug: 'sliding-window-maximum', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 1173, title: 'Immediate Food Delivery I', difficulty: 'Easy', lcSlug: 'immediate-food-delivery-i', frequency: 50, pattern: 'SQL' },
  { company: 'DoorDash', lcNumber: 1174, title: 'Immediate Food Delivery II', difficulty: 'Medium', lcSlug: 'immediate-food-delivery-ii', frequency: 50, pattern: 'SQL' },
  { company: 'DoorDash', lcNumber: 1944, title: 'Number of Visible People in a Queue', difficulty: 'Hard', lcSlug: 'number-of-visible-people-in-a-queue', frequency: 25, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 286, title: 'Walls and Gates', difficulty: 'Medium', lcSlug: 'walls-and-gates', frequency: 100 },
  { company: 'DoorDash', lcNumber: 296, title: 'Best Meeting Point', difficulty: 'Hard', lcSlug: 'best-meeting-point', frequency: 37.5, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 297, title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', lcSlug: 'serialize-and-deserialize-binary-tree', frequency: 50 },
  { company: 'DoorDash', lcNumber: 317, title: 'Shortest Distance from All Buildings', difficulty: 'Hard', lcSlug: 'shortest-distance-from-all-buildings', frequency: 75, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 1235, title: 'Maximum Profit in Job Scheduling', difficulty: 'Hard', lcSlug: 'maximum-profit-in-job-scheduling', frequency: 75, pattern: '1-D Dynamic Programming' },
  { company: 'DoorDash', lcNumber: 329, title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard', lcSlug: 'longest-increasing-path-in-a-matrix', frequency: 87.5 },
  { company: 'DoorDash', lcNumber: 1268, title: 'Search Suggestions System', difficulty: 'Medium', lcSlug: 'search-suggestions-system', frequency: 87.5, pattern: 'Tries' },
  { company: 'DoorDash', lcNumber: 1359, title: 'Count All Valid Pickup and Delivery Options', difficulty: 'Hard', lcSlug: 'count-all-valid-pickup-and-delivery-options', frequency: 62.5, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 1347, title: 'Minimum Number of Steps to Make Two Strings Anagram', difficulty: 'Medium', lcSlug: 'minimum-number-of-steps-to-make-two-strings-anagram', frequency: 62.5, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 1730, title: 'Shortest Path to Get Food', difficulty: 'Medium', lcSlug: 'shortest-path-to-get-food', frequency: 37.5, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 556, title: 'Next Greater Element III', difficulty: 'Medium', lcSlug: 'next-greater-element-iii', frequency: 62.5, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 588, title: 'Design In-Memory File System', difficulty: 'Hard', lcSlug: 'design-in-memory-file-system', frequency: 62.5, pattern: 'Design' },
  { company: 'DoorDash', lcNumber: 2565, title: 'Subsequence With the Minimum Score', difficulty: 'Hard', lcSlug: 'subsequence-with-the-minimum-score', frequency: 50, pattern: 'Two Pointers' },
  { company: 'DoorDash', lcNumber: 658, title: 'Find K Closest Elements', difficulty: 'Medium', lcSlug: 'find-k-closest-elements', frequency: 62.5, pattern: 'Binary Search' },
  { company: 'DoorDash', lcNumber: 2611, title: 'Mice and Cheese', difficulty: 'Medium', lcSlug: 'mice-and-cheese', frequency: 50, pattern: 'Greedy' },
  { company: 'DoorDash', lcNumber: 735, title: 'Asteroid Collision', difficulty: 'Medium', lcSlug: 'asteroid-collision', frequency: 37.5, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 772, title: 'Basic Calculator III', difficulty: 'Hard', lcSlug: 'basic-calculator-iii', frequency: 62.5, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 778, title: 'Swim in Rising Water', difficulty: 'Hard', lcSlug: 'swim-in-rising-water', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 826, title: 'Most Profit Assigning Work', difficulty: 'Medium', lcSlug: 'most-profit-assigning-work', frequency: 62.5, pattern: 'Greedy' },
  { company: 'DoorDash', lcNumber: 827, title: 'Making A Large Island', difficulty: 'Hard', lcSlug: 'making-a-large-island', frequency: 62.5, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 1779, title: 'Find Nearest Point That Has the Same X or Y Coordinate', difficulty: 'Easy', lcSlug: 'find-nearest-point-that-has-the-same-x-or-y-coordinate', frequency: 50, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 859, title: 'Buddy Strings', difficulty: 'Easy', lcSlug: 'buddy-strings', frequency: 62.5, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 1790, title: 'Check if One String Swap Can Make Strings Equal', difficulty: 'Easy', lcSlug: 'check-if-one-string-swap-can-make-strings-equal', frequency: 62.5, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', lcSlug: 'koko-eating-bananas', frequency: 75 },
  { company: 'DoorDash', lcNumber: 1834, title: 'Single-Threaded CPU', difficulty: 'Medium', lcSlug: 'single-threaded-cpu', frequency: 75, pattern: 'Heap / Priority Queue' },
  { company: 'DoorDash', lcNumber: 1905, title: 'Count Sub Islands', difficulty: 'Medium', lcSlug: 'count-sub-islands', frequency: 37.5, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 695, title: 'Max Area of Island', difficulty: 'Medium', lcSlug: 'max-area-of-island', frequency: 50 },
  { company: 'DoorDash', lcNumber: 1472, title: 'Design Browser History', difficulty: 'Medium', lcSlug: 'design-browser-history', frequency: 25, pattern: 'Design' },
  { company: 'DoorDash', lcNumber: 460, title: 'LFU Cache', difficulty: 'Hard', lcSlug: 'lfu-cache', frequency: 25, pattern: 'Linked List' },
  { company: 'DoorDash', lcNumber: 542, title: '01 Matrix', difficulty: 'Medium', lcSlug: '01-matrix', frequency: 50, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 49, title: 'Group Anagrams', difficulty: 'Medium', lcSlug: 'group-anagrams', frequency: 25 },
  { company: 'DoorDash', lcNumber: 314, title: 'Binary Tree Vertical Order Traversal', difficulty: 'Medium', lcSlug: 'binary-tree-vertical-order-traversal', frequency: 37.5, pattern: 'Trees' },
  { company: 'DoorDash', lcNumber: 1664, title: 'Ways to Make a Fair Array', difficulty: 'Medium', lcSlug: 'ways-to-make-a-fair-array', frequency: 37.5, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 1087, title: 'Brace Expansion', difficulty: 'Medium', lcSlug: 'brace-expansion', frequency: 25, pattern: 'Backtracking' },
  { company: 'DoorDash', lcNumber: 924, title: 'Minimize Malware Spread', difficulty: 'Hard', lcSlug: 'minimize-malware-spread', frequency: 37.5, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 209, title: 'Minimum Size Subarray Sum', difficulty: 'Medium', lcSlug: 'minimum-size-subarray-sum', frequency: 50, pattern: 'Sliding Window' },
  { company: 'DoorDash', lcNumber: 480, title: 'Sliding Window Median', difficulty: 'Hard', lcSlug: 'sliding-window-median', frequency: 37.5, pattern: 'Heap / Priority Queue' },
  { company: 'DoorDash', lcNumber: 18, title: '4Sum', difficulty: 'Medium', lcSlug: '4sum', frequency: 37.5, pattern: 'Two Pointers' },
  { company: 'DoorDash', lcNumber: 304, title: 'Range Sum Query 2D - Immutable', difficulty: 'Medium', lcSlug: 'range-sum-query-2d-immutable', frequency: 25, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 380, title: 'Insert Delete GetRandom O(1)', difficulty: 'Medium', lcSlug: 'insert-delete-getrandom-o1', frequency: 37.5, pattern: 'Arrays & Hashing' },
  { company: 'DoorDash', lcNumber: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard', lcSlug: 'merge-k-sorted-lists', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 839, title: 'Similar String Groups', difficulty: 'Hard', lcSlug: 'similar-string-groups', frequency: 37.5, pattern: 'Graphs' },
  { company: 'DoorDash', lcNumber: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', lcSlug: 'longest-palindromic-substring', frequency: 25 },
  { company: 'DoorDash', lcNumber: 207, title: 'Course Schedule', difficulty: 'Medium', lcSlug: 'course-schedule', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 13, title: 'Roman to Integer', difficulty: 'Easy', lcSlug: 'roman-to-integer', frequency: 25, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 3123, title: 'Find Edges in Shortest Paths', difficulty: 'Hard', lcSlug: 'find-edges-in-shortest-paths', frequency: 25, pattern: 'Advanced Graphs' },
  { company: 'DoorDash', lcNumber: 12, title: 'Integer to Roman', difficulty: 'Medium', lcSlug: 'integer-to-roman', frequency: 37.5, pattern: 'Math & Geometry' },
  { company: 'DoorDash', lcNumber: 56, title: 'Merge Intervals', difficulty: 'Medium', lcSlug: 'merge-intervals', frequency: 37.5 },
  { company: 'DoorDash', lcNumber: 994, title: 'Rotting Oranges', difficulty: 'Medium', lcSlug: 'rotting-oranges', frequency: 25 },
  { company: 'DoorDash', lcNumber: 456, title: '132 Pattern', difficulty: 'Medium', lcSlug: '132-pattern', frequency: 50, pattern: 'Stack' },
  { company: 'DoorDash', lcNumber: 2, title: 'Add Two Numbers', difficulty: 'Medium', lcSlug: 'add-two-numbers', frequency: 25 },
  { company: 'DoorDash', lcNumber: 543, title: 'Diameter of Binary Tree', difficulty: 'Easy', lcSlug: 'diameter-of-binary-tree', frequency: 25 },
  // Ripple
  { company: 'Ripple', lcNumber: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium', lcSlug: 'subarray-sum-equals-k', frequency: 87.5, pattern: 'Arrays & Hashing' },
  { company: 'Ripple', lcNumber: 146, title: 'LRU Cache', difficulty: 'Medium', lcSlug: 'lru-cache', frequency: 87.5 },
  { company: 'Ripple', lcNumber: 443, title: 'String Compression', difficulty: 'Medium', lcSlug: 'string-compression', frequency: 87.5, pattern: 'Two Pointers' },
  { company: 'Ripple', lcNumber: 875, title: 'Koko Eating Bananas', difficulty: 'Medium', lcSlug: 'koko-eating-bananas', frequency: 87.5 },
  { company: 'Ripple', lcNumber: 56, title: 'Merge Intervals', difficulty: 'Medium', lcSlug: 'merge-intervals', frequency: 100 },
  { company: 'Ripple', lcNumber: 224, title: 'Basic Calculator', difficulty: 'Hard', lcSlug: 'basic-calculator', frequency: 87.5, pattern: 'Stack' },
  { company: 'Ripple', lcNumber: 853, title: 'Car Fleet', difficulty: 'Medium', lcSlug: 'car-fleet', frequency: 87.5 },
  { company: 'Ripple', lcNumber: 1047, title: 'Remove All Adjacent Duplicates In String', difficulty: 'Easy', lcSlug: 'remove-all-adjacent-duplicates-in-string', frequency: 87.5, pattern: 'Stack' },
]

export function formatFrequencyPct(n: number): string {
  return `${n}%`
}

export function maxCompanyFrequency(
  problem: CodingProblem,
  companies: readonly string[],
): number {
  let max = 0
  for (const company of companies) {
    const n = problem.companyFrequency?.[company]
    if (typeof n === 'number' && n > max) max = n
  }
  return max
}

export function problemHasCompany(
  problem: CodingProblem,
  companies: readonly string[],
): boolean {
  if (companies.length === 0) return true
  const tagged = new Set(problem.companies ?? [])
  return companies.some((company) => tagged.has(company))
}

function addCompany(
  problem: CodingProblem,
  seed: CompanyQuestionSeed,
): CodingProblem {
  const companies = problem.companies?.includes(seed.company)
    ? problem.companies
    : [...(problem.companies ?? []), seed.company]
  return {
    ...problem,
    lcSlug: problem.lcSlug ?? seed.lcSlug,
    companies,
    companyFrequency: {
      ...problem.companyFrequency,
      [seed.company]: seed.frequency,
    },
  }
}

/** Tag catalog problems with company lists; append company-only LeetCode numbers. */
export function applyCompanyQuestionTags(catalog: CodingProblem[]): CodingProblem[] {
  const byLc = new Map(catalog.map((p) => [p.lcNumber, p]))
  const extras: CodingProblem[] = []

  for (const seed of COMPANY_QUESTION_SEEDS) {
    const existingProblem = byLc.get(seed.lcNumber)
    if (existingProblem) {
      byLc.set(seed.lcNumber, addCompany(existingProblem, seed))
      continue
    }
    if (!seed.pattern) {
      throw new Error(`Company question LC ${seed.lcNumber} needs a pattern`)
    }
    const created = addCompany(
      {
        id: neetCodeCatalogId(seed.lcNumber),
        pattern: seed.pattern,
        title: seed.title,
        lcNumber: seed.lcNumber,
        difficulty: seed.difficulty,
        lcSlug: seed.lcSlug,
        confidence: 'not_practiced',
        practiceCount: 0,
        lastPracticedDay: null,
        notes: '',
      },
      seed,
    )
    byLc.set(seed.lcNumber, created)
    extras.push(created)
  }

  const seen = new Set<number>()
  const out: CodingProblem[] = []
  for (const p of catalog) {
    const tagged = byLc.get(p.lcNumber)
    if (tagged) out.push(tagged)
    seen.add(p.lcNumber)
  }
  for (const p of extras) {
    if (seen.has(p.lcNumber)) continue
    const tagged = byLc.get(p.lcNumber)
    if (tagged) {
      out.push(tagged)
      seen.add(p.lcNumber)
    }
  }
  return out
}
