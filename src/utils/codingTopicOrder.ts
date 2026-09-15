/**
 * NeetCode 150 roadmap order: fundamentals first, then more advanced topics.
 * Unknown `pattern` values sort after these, alphabetically among themselves.
 */
const TOPIC_ORDER = new Map<string, number>([
  ['arrays & hashing', 0],
  /** Legacy seed labels */
  ['frequency map', 0],
  ['hash map', 0],
  ['string', 0],
  ['two pointers', 1],
  ['sliding window', 2],
  ['string parsing', 2],
  ['pattern matching', 3],
  ['stack', 3],
  ['binary search', 4],
  ['linked list', 5],
  ['design', 6],
  ['tree', 7],
  ['trees', 7],
  ['trie', 8],
  ['tries', 8],
  ['heap', 9],
  ['heap / priority queue', 9],
  ['backtracking', 10],
  ['recursion / backtracking', 10],
  ['graph', 11],
  ['graphs', 11],
  ['advanced graphs', 12],
  ['1-d dynamic programming', 13],
  ['dynamic programming', 13],
  ['2-d dynamic programming', 14],
  ['greedy', 15],
  ['intervals', 16],
  ['math & geometry', 17],
  ['bit manipulation', 18],
  ['sql', 19],
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
