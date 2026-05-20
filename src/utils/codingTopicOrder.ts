/**
 * NeetCode-style roadmap order: fundamentals first, then more advanced topics.
 * Unknown `pattern` values sort after these, alphabetically among themselves.
 */
const TOPIC_ORDER = new Map<string, number>([
  ['arrays & hashing', 0],
  ['frequency map', 0],
  ['hash map', 0],
  /** Often grouped with arrays/hashing on NeetCode-style roadmaps */
  ['string', 0],
  ['two pointers', 1],
  ['sliding window', 2],
  ['stack', 3],
  ['binary search', 4],
  ['linked list', 5],
  ['tree', 6],
  ['trees', 6],
  ['trie', 7],
  ['tries', 7],
  ['heap', 8],
  ['heap / priority queue', 8],
  ['intervals', 9],
  ['graph', 10],
  ['graphs', 10],
  ['advanced graphs', 11],
  ['recursion / backtracking', 12],
  ['backtracking', 12],
  ['greedy', 13],
  ['dynamic programming', 14],
  ['2-d dynamic programming', 15],
  ['math & geometry', 16],
  ['bit manipulation', 17],
])

const UNKNOWN = 1000

export function topicRoadmapRank(pattern: string): number {
  const key = pattern.trim().toLowerCase()
  return TOPIC_ORDER.get(key) ?? UNKNOWN
}

/** Sort topic names for section order (NeetCode roadmap style). */
export function compareTopicPatterns(a: string, b: string): number {
  const ra = topicRoadmapRank(a)
  const rb = topicRoadmapRank(b)
  if (ra !== rb) return ra - rb
  return a.localeCompare(b, undefined, { sensitivity: 'base' })
}
