/** Building blocks — study order; checklistId persists completion. */
export const BUILDING_BLOCKS = [
  {
    checklistId: 'bb-queues',
    title: 'Message queues',
    detail:
      'At-least-once vs exactly-once, consumer groups, backpressure, dead letter queues.',
  },
  {
    checklistId: 'bb-lb',
    title: 'Load balancers',
    detail: 'L4 vs L7, algorithms, health checks, sticky sessions.',
  },
  {
    checklistId: 'bb-cache',
    title: 'Caching',
    detail: 'Eviction policies, invalidation strategies, Redis vs Memcached, where to put it.',
  },
  {
    checklistId: 'bb-db',
    title: 'Databases',
    detail: 'SQL vs NoSQL, replication, sharding, indexing, CAP theorem.',
  },
  {
    checklistId: 'bb-cdn',
    title: 'CDNs',
    detail: 'Push vs pull, cache-control headers, origin shield.',
  },
  {
    checklistId: 'bb-rl',
    title: 'Rate limiting',
    detail: 'Token bucket vs leaky bucket vs sliding window; where to enforce it.',
  },
  {
    checklistId: 'bb-api',
    title: 'API design',
    detail: 'REST vs gRPC, API gateways, versioning, idempotency.',
  },
  {
    checklistId: 'bb-search',
    title: 'Search',
    detail: 'Inverted indexes, Elasticsearch basics, relevance ranking.',
  },
  {
    checklistId: 'bb-storage',
    title: 'Storage',
    detail: 'Blob vs block vs object; S3-compatible patterns.',
  },
  {
    checklistId: 'bb-obs',
    title: 'Observability',
    detail: 'Metrics, tracing, structured logging, alerting.',
  },
] as const

export const CHECKLIST_PHASE1_KICKOFF = [
  {
    id: 'p1-xu-ch1',
    label:
      'Skim Alex Xu Vol 1 Chapter 1 as anchor; note terms you will revisit per block.',
  },
  {
    id: 'p1-bookmarks',
    label:
      'Bookmark Hello Interview concepts and ByteByteGo; pick where you will write the five answers (doc or paper).',
  },
] as const

export const CHECKLIST_PHASE2_HABIT = [
  {
    id: 'p2-three-step',
    label:
      'On every new design problem: solo ~20 min (no solutions) → read Xu / Hello Interview + gap list → redo missed parts on paper or Excalidraw.',
  },
] as const

export const CHECKLIST_PHASE3 = [
  {
    id: 'p3-mock-log',
    label:
      'Create a mock log (date, topic, where you stalled, which stall-checklist prompts you forgot).',
  },
  {
    id: 'p3-calendar',
    label:
      'Block every other Saturday from week 4 onward: 45-minute timed mock.',
  },
  {
    id: 'p3-stall-practice',
    label:
      'Practice the stall checklist until it is automatic (run it out loud after each component).',
  },
  {
    id: 'p3-ai-mocks',
    label: 'Complete 4–5 Hello Interview AI mocks for early reps.',
  },
  {
    id: 'p3-live-mocks',
    label: 'Add live peer mocks once AI mocks feel repetitive.',
  },
] as const

export const CHECKLIST_PARALLEL = [
  {
    id: 'parallel-ddia',
    label:
      'DDIA (Kleppmann): parallel slow read — prioritize database, queue, and replication chapters.',
  },
] as const

type ChecklistTask = { id: string; label: string }

function labelsFromTasks(tasks: readonly ChecklistTask[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const t of tasks) {
    out[t.id] = t.label
  }
  return out
}

/** Labels for persisted checklist task ids (practice log). */
export const SYSTEM_CHECKLIST_TASK_LABELS: Record<string, string> = {
  ...labelsFromTasks(CHECKLIST_PHASE1_KICKOFF),
  ...labelsFromTasks(CHECKLIST_PHASE2_HABIT),
  ...labelsFromTasks(CHECKLIST_PHASE3),
  ...labelsFromTasks(CHECKLIST_PARALLEL),
  ...Object.fromEntries(
    BUILDING_BLOCKS.map((b) => [b.checklistId, b.title]),
  ),
}
