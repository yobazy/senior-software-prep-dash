import type {
  AnswerQuestion,
  AnswerStory,
  CoachingSnapshot,
  Correction,
  DrillCard,
  FeedbackBlock,
  LivePackMeta,
  PrepCorpus,
  PrepFile,
  PrepFileKind,
  ProjectCard,
  Readiness,
  StoryCard,
  StoryIndexRow,
  TagIndexRow,
  TodoItem,
  VetTrait,
} from './types'
import {
  extractBlockquotes,
  extractBracketTags,
  extractHashTags,
  extractOpenGaps,
  fieldValue,
  mapStarKey,
  parseBoldFields,
  parseCheckboxes,
  parseDraftStatus,
  parseNumberedItems,
  parsePipeTables,
  slug,
  splitByHeading,
  stripCite,
  stripHashTagsFromTitle,
} from './md'

export function classifyPrepFile(filename: string): PrepFileKind {
  const n = filename.toLowerCase().replace(/_/g, '-')
  if (n.includes('todo') || n.includes('to-do')) return 'todo'
  if (n.includes('story-bank') || n.includes('story-bank')) return 'stories'
  if (n.includes('answer-bank') || n.includes('behavioral')) return 'answers'
  if (
    n.includes('project-context') ||
    n.includes('project-context') ||
    n.includes('context-sheet')
  ) {
    return 'projects'
  }
  if (n.includes('feedback')) return 'feedback'
  if (n.includes('coaching')) return 'coaching'
  if (n.includes('prep') && n.endsWith('.md')) return 'live'
  return 'other'
}

export function parsePrepCorpus(files: PrepFile[]): PrepCorpus {
  const cleaned = files.map((f) => ({ ...f, content: stripCite(f.content) }))
  let todo: TodoItem[] = []
  let focusItems: string[] = []
  let stories: StoryCard[] = []
  let storyIndex: StoryIndexRow[] = []
  let accuracyRules: string[] = []
  let answerStories: AnswerStory[] = []
  let answerQuestions: AnswerQuestion[] = []
  let vet: VetTrait[] = []
  let projects: ProjectCard[] = []
  let corrections: Correction[] = []
  let feedback: FeedbackBlock[] = []
  let live: LivePackMeta | null = null
  let liveDrill: DrillCard[] = []
  let coaching: CoachingSnapshot | null = null

  for (const file of cleaned) {
    const kind = classifyPrepFile(file.name)
    try {
      if (kind === 'todo') {
        const parsed = parseTodo(file.content)
        todo = parsed.items
        focusItems = parsed.focus
      } else if (kind === 'stories') {
        const parsed = parseStoryBank(file.content)
        stories = parsed.stories
        storyIndex = parsed.index
        accuracyRules = parsed.rules
      } else if (kind === 'answers') {
        const parsed = parseAnswerBank(file.content)
        answerStories = parsed.stories
        answerQuestions = parsed.questions
        vet = parsed.vet
      } else if (kind === 'projects') {
        projects = parseProjects(file.content)
      } else if (kind === 'feedback') {
        const parsed = parseFeedback(file.content)
        corrections = parsed.corrections
        feedback = parsed.sections
      } else if (kind === 'live') {
        const parsed = parseLivePack(file.content)
        live = parsed.meta
        liveDrill = parsed.drill
      } else if (kind === 'coaching') {
        coaching = parseCoaching(file.content)
      }
    } catch {
      /* keep remaining files */
    }
  }

  const storiesWithStatus = overlayStoryStatus(stories, answerStories)
  const drill = mergeDrill(liveDrill, questionsToDrill(answerQuestions))
  const readiness = computeReadiness({
    todo,
    live,
    stories: storiesWithStatus,
    drill,
  })

  return {
    files,
    todo,
    focusItems,
    stories: storiesWithStatus,
    storyIndex,
    accuracyRules,
    answerStories,
    answerQuestions,
    vet,
    drill,
    projects,
    corrections,
    feedback,
    live,
    coaching,
    readiness,
  }
}

function parseTodo(md: string): { items: TodoItem[]; focus: string[] } {
  const items: TodoItem[] = []
  const focus: string[] = []
  for (const section of splitByHeading(md, 1)) {
    if (/short version/i.test(section.title)) {
      for (const n of parseNumberedItems(section.body)) {
        focus.push(n.text.replace(/\*\*/g, ''))
      }
      continue
    }
    const priority = priorityFromHeading(section.title)
    for (const box of parseCheckboxes(section.body)) {
      items.push({
        id: `todo-${priority}-${slug(box.title)}`,
        status:
          box.status === 'done' ? 'done' : box.status === 'doing' ? 'doing' : 'open',
        title: box.title,
        detail: box.detail,
        priority,
        section: section.title,
      })
    }
  }
  return { items, focus }
}

function priorityFromHeading(title: string): string {
  const p = /\bP(\d)\b/i.exec(title)
  if (p) return `P${p[1]}`
  if (/done/i.test(title)) return 'DONE'
  return 'OTHER'
}

function parseStoryBank(md: string): {
  stories: StoryCard[]
  index: StoryIndexRow[]
  rules: string[]
} {
  const rules: string[] = []
  const pre = md.split(/^## /m)[0] ?? md
  for (const line of pre.split('\n')) {
    const m = /^\s*[-*]\s+\*\*(.+?)\*\*\s*(.*)$/.exec(line)
    if (m) rules.push(`${m[1].replace(/\.$/, '')}. ${m[2]}`.trim())
  }

  const index: StoryIndexRow[] = []
  for (const table of parsePipeTables(md)) {
    const askI = table.headers.findIndex((h) => /asked|ask/i.test(h))
    const goI = table.headers.findIndex((h) => /go to|story/i.test(h))
    if (askI === -1 || goI === -1) continue
    for (const row of table.rows) {
      const ask = (row[askI] ?? '').trim()
      const goTo = (row[goI] ?? '').trim()
      if (ask) index.push({ ask, goTo })
    }
  }

  const stories: StoryCard[] = []
  for (const section of splitByHeading(md, 3)) {
    const themeMatch = /^\[([^\]]+)\]\s*(.*)$/.exec(section.title)
    const theme = themeMatch?.[1] ?? ''
    const title = themeMatch?.[2] ?? section.title
    const fields = parseBoldFields(section.body)
    let situation = ''
    let task = ''
    let action = ''
    let result = ''
    let reflection = ''
    const accuracyNotes: string[] = []
    for (const f of fields) {
      const star = mapStarKey(f.key)
      if (star === 'situation') situation = f.value
      else if (star === 'task') task = f.value
      else if (star === 'action') action = f.value
      else if (star === 'result') result = f.value
      else if (/reflection/i.test(f.key)) reflection = f.value
      else if (/accuracy/i.test(f.key)) accuracyNotes.push(f.value)
    }
    stories.push({
      id: `story-${slug(title)}`,
      theme,
      title,
      source: fieldValue(fields, ['source', 'source']),
      situation,
      task,
      action,
      result,
      reflection,
      bestFor: fieldValue(fields, [
        'best for questions about',
        'best for questions about',
        'best for',
      ]),
      accuracyNotes,
    })
  }
  return { stories, index, rules }
}

function parseAnswerBank(md: string): {
  stories: AnswerStory[]
  questions: AnswerQuestion[]
  vet: VetTrait[]
} {
  const stories: AnswerStory[] = []
  const questions: AnswerQuestion[] = []
  const vet: VetTrait[] = []

  for (const section of splitByHeading(md, 2)) {
    const vetMatch =
      /^(.*?)[—-]\s*\*\*(COVERED|THIN|WEAK|DECENT|WEAKEST)\b[^*]*\*\*/i.exec(
        section.title,
      ) ??
      /^(.*?)\s+\*\*(COVERED|THIN|WEAK|DECENT|WEAKEST)\b[^*]*\*\*/i.exec(section.title)
    if (vetMatch) {
      vet.push({
        name: stripEmoji(vetMatch[1] ?? '').trim(),
        level: (vetMatch[2] ?? '').toUpperCase(),
        note: section.body.split('\n')[0]?.replace(/\*\*/g, '').trim() ?? '',
      })
      continue
    }

    const storyHead = /^(S\d+[a-z]?)\.\s*(.*)$/i.exec(section.title)
    if (storyHead) {
      const code = storyHead[1] ?? ''
      stories.push({
        id: `ans-${slug(code)}`,
        code,
        title: storyHead[2] ?? section.title,
        tags: extractBracketTags(section.body),
        status: parseDraftStatus(section.body) ?? 'empty',
        statusNote: statusLine(section.body),
        spoken: spokenFromAnswer(section.body),
        body: section.body,
      })
      continue
    }

    const qHead = /^(Q\d+[a-z]?)\.\s*(.*)$/i.exec(section.title)
    if (qHead) {
      const code = qHead[1] ?? ''
      questions.push({
        id: `q-${slug(code)}`,
        code,
        title: qHead[2] ?? section.title,
        tags: extractBracketTags(section.body),
        status: parseDraftStatus(section.body) ?? 'empty',
        spoken: spokenFromAnswer(section.body),
        body: section.body,
      })
    }
  }
  return { stories, questions, vet }
}

function spokenFromAnswer(body: string): string {
  const quotes = extractBlockquotes(body)
  if (quotes.length > 0) return quotes.join('\n\n')
  const spoken = splitByHeading(body, 3).find((p) => /spoken/i.test(p.title))
  return spoken?.body.trim() ?? ''
}

function statusLine(body: string): string {
  const m = /\*\*Status:\s*([^*]+)\*\*/i.exec(body)
  return m?.[1]?.trim() ?? ''
}

function parseProjects(md: string): ProjectCard[] {
  const cards: ProjectCard[] = []
  for (const section of splitByHeading(md, 1)) {
    if (!/^\d+\./.test(section.title)) continue
    const fields = parseBoldFields(section.body)
    const extras: { label: string; value: string }[] = []
    const used =
      /^(what it is|who it was for|why it mattered|what i would do differently|the constraint|difficult or controversial|status|my role|why this project)/i
    for (const f of fields) {
      if (!used.test(f.key)) extras.push({ label: f.key, value: f.value })
    }
    cards.push({
      id: `proj-${slug(section.title)}`,
      title: section.title.replace(/^\d+\.\s*/, ''),
      what: fieldValue(fields, ['what it is', 'what it is']),
      who: fieldValue(fields, ['who it was for', 'who it was for']),
      why: fieldValue(fields, ['why it mattered', 'why it mattered', 'why this project']),
      role: fieldValue(fields, ['my role', 'my role']),
      constraint: fieldValue(fields, [
        'the constraint worth naming up front',
        'the constraint worth naming up front',
      ]),
      difficult: fieldValue(fields, [
        'difficult or controversial',
        'difficult or controversial',
      ]),
      differently: fieldValue(fields, [
        'what i would do differently',
        'what i would do differently',
      ]),
      status: fieldValue(fields, [
        'status, stated accurately',
        'status, stated accurately',
        'status',
      ]),
      extras,
    })
  }
  return cards
}

function parseFeedback(md: string): {
  corrections: Correction[]
  sections: FeedbackBlock[]
} {
  const corrections: Correction[] = []
  const sections: FeedbackBlock[] = []
  const h1 = splitByHeading(md, 1)
  const active = h1.find((s) => /active corrections/i.test(s.title))
  if (active) {
    for (const item of parseNumberedItems(active.body)) {
      const bold = /^\*\*(.+?)\*\*\s*(.*)$/.exec(item.text)
      corrections.push({
        n: item.n,
        title: bold ? bold[1].replace(/\.$/, '') : item.text.slice(0, 80),
        body: bold ? bold[2] : item.text,
      })
    }
  }
  for (const s of splitByHeading(md, 2)) {
    sections.push({ title: s.title, body: clip(s.body, 1600) })
  }
  return { corrections, sections }
}

function parseLivePack(md: string): { meta: LivePackMeta; drill: DrillCard[] } {
  const h1 = /^#\s+(.+)$/m.exec(md)?.[1] ?? ''
  const [company, role] = splitDash(h1)
  const round = /^##\s+(.+)$/m.exec(md)?.[1] ?? ''

  let whyCompany = ''
  const rules: string[] = []
  const tagIndex: TagIndexRow[] = []
  const beforeCall: string[] = []
  const drill: DrillCard[] = []

  for (const section of splitByHeading(md, 2)) {
    const title = section.title
    if (/rules for this call/i.test(title)) {
      for (const n of parseNumberedItems(section.body)) {
        rules.push(n.text.replace(/\*\*/g, ''))
      }
      continue
    }
    if (/tag index/i.test(title)) {
      for (const table of parsePipeTables(section.body)) {
        const askI = table.headers.findIndex((h) => /ask/i.test(h))
        const searchI = table.headers.findIndex((h) => /search/i.test(h))
        if (askI === -1) continue
        for (const row of table.rows) {
          const ask = (row[askI] ?? '').trim()
          const search = (row[searchI] ?? '').trim()
          if (ask) {
            tagIndex.push({
              ask,
              tags: extractHashTags(`${search} ${row.join(' ')}`),
              search,
            })
          }
        }
      }
      continue
    }
    if (/company in four lines/i.test(title)) {
      whyCompany = extractBlockquotes(section.body).join('\n\n') || section.body.trim()
      continue
    }
    if (/before the call/i.test(title)) {
      for (const n of parseNumberedItems(section.body)) {
        beforeCall.push(n.text.replace(/\*\*/g, ''))
      }
      continue
    }
    const tags = extractHashTags(title)
    if (tags.length === 0) continue
    const spoken = extractBlockquotes(section.body).join('\n\n')
    drill.push({
      id: `live-${slug(stripHashTagsFromTitle(title) || tags.join('-'))}`,
      source: 'live',
      tags,
      title: stripHashTagsFromTitle(title) || tags.map((t) => `#${t}`).join(' '),
      spoken,
      notes: dropBlockquoteLines(section.body).trim(),
      openGaps: extractOpenGaps(section.body),
    })
  }

  return {
    meta: {
      company: company || 'Interview',
      role,
      round,
      whyCompany,
      rules,
      tagIndex,
      beforeCall,
    },
    drill,
  }
}

function parseCoaching(md: string): CoachingSnapshot {
  const profile = splitByHeading(md, 2).find((s) => /profile/i.test(s.title))
  const body = profile?.body ?? md
  const line = (label: string) => {
    const re = new RegExp(`[-*]\\s+${label}:\\s*(.*)$`, 'im')
    return re.exec(body)?.[1]?.trim() ?? ''
  }
  const timeline = line('Interview timeline')
  return {
    targetRole: line('Target role\\(s\\)') || line('Target role'),
    interviewDate: /(\d{4}-\d{2}-\d{2})/.exec(timeline)?.[1] ?? null,
    interviewLabel: timeline,
    mode: line('Time-aware coaching mode'),
    bottleneck: line('Biggest concern'),
    concern: line('Biggest concern'),
  }
}

function overlayStoryStatus(stories: StoryCard[], answers: AnswerStory[]): StoryCard[] {
  return stories.map((story) => {
    const match = answers.find((a) => titlesOverlap(story.title, a.title))
    return match ? { ...story, draftStatus: match.status } : story
  })
}

function questionsToDrill(questions: AnswerQuestion[]): DrillCard[] {
  return questions.map((q) => ({
    id: q.id,
    source: 'bank' as const,
    tags: q.tags,
    title: `${q.code}. ${q.title}`,
    spoken: q.spoken,
    notes: q.body,
    openGaps:
      q.status === 'empty' || q.status === 'probing' ? ['No spoken draft yet.'] : [],
  }))
}

function mergeDrill(live: DrillCard[], bank: DrillCard[]): DrillCard[] {
  const seen = new Set(live.map((c) => normTitle(c.title)))
  const extra = bank.filter((c) => {
    const n = normTitle(c.title)
    for (const s of seen) {
      if (n.includes(s) || s.includes(n)) return false
    }
    return true
  })
  return [...live, ...extra]
}

function computeReadiness(input: {
  todo: TodoItem[]
  live: LivePackMeta | null
  stories: StoryCard[]
  drill: DrillCard[]
}): Readiness {
  const p0 = input.todo.filter((t) => t.priority === 'P0')
  const p0Total = p0.length
  const p0Done = p0.filter((t) => t.status === 'done').length
  const p0Doing = p0.filter((t) => t.status === 'doing').length
  const openFacts =
    (input.live?.beforeCall.length ?? 0) +
    input.drill.filter((d) => d.source === 'live' && d.openGaps.length > 0).length
  const storyTotal = input.stories.length
  const draftedStories = input.stories.filter((s) => s.draftStatus === 'drafted').length
  const outlinedStories = input.stories.filter((s) => s.draftStatus === 'outlined').length
  const doing = input.todo.find((t) => t.status === 'doing')
  const pitchMatch = /(\d+\s*\/\s*10)/.exec(`${doing?.title ?? ''} ${doing?.detail ?? ''}`)
  const pitch = pitchMatch?.[1] ?? null

  const p0Score = p0Total === 0 ? 0 : (p0Done + 0.4 * p0Doing) / p0Total
  const factScore = openFacts === 0 ? 0.7 : Math.max(0, 1 - openFacts / 14)
  const storyScore =
    storyTotal === 0 ? 0 : (draftedStories + 0.5 * outlinedStories) / storyTotal
  const percent = Math.round((p0Score * 0.55 + factScore * 0.25 + storyScore * 0.2) * 100)

  let headline = 'Load a prep folder to see how close you are.'
  if (p0Total > 0) {
    const left = p0Total - p0Done
    headline =
      left === 0
        ? 'P0 is clear. Rehearse out loud.'
        : `${left} P0 item${left === 1 ? '' : 's'} still open before the call.`
  }

  return {
    percent,
    p0Done,
    p0Total,
    openFacts,
    draftedStories,
    storyTotal,
    pitch,
    headline,
  }
}

function dropBlockquoteLines(md: string): string {
  return md
    .split('\n')
    .filter((l) => !l.startsWith('>'))
    .join('\n')
}

function splitDash(title: string): [string, string] {
  const parts = title.split(/\s+[—–-]\s+/)
  if (parts.length < 2) return [title.trim(), '']
  return [parts[0]!.trim(), parts.slice(1).join(' — ')]
}

function stripEmoji(s: string): string {
  return s
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\p{M}/gu, '')
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function clip(body: string, max: number): string {
  const t = body.trim()
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`
}

const TITLE_CLUES: string[][] = [
  ['cn', 'metrolinx', 'atlas'],
  ['360'],
  ['onxpress'],
  ['barberbot', 'barber'],
  ['obsidian', 'rag'],
  ['myfi'],
  ['urbaneyes'],
  ['prisma'],
]

function titlesOverlap(a: string, b: string): boolean {
  const na = normTitle(a)
  const nb = normTitle(b)
  for (const group of TITLE_CLUES) {
    const inA = group.some((t) => na.includes(t))
    const inB = group.some((t) => nb.includes(t))
    if (inA && inB) return true
  }
  const wa = significant(a)
  const wb = significant(b)
  if (wa.size === 0 || wb.size === 0) return false
  let n = 0
  for (const w of wb) if (wa.has(w)) n += 1
  return n >= 2
}

function significant(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter((w) => w.length > 3),
  )
}

function normTitle(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}
