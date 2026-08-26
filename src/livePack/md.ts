import type { DraftStatus } from './types'

export function stripCite(text: string): string {
  return text
    .replace(/<\/?cite\b[^>]*>/gi, '')
    .replace(/\r\n/g, '\n')
}

export function slug(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
  return s || 'item'
}

export function splitByHeading(
  markdown: string,
  level: 1 | 2 | 3,
): { title: string; body: string }[] {
  const lines = markdown.split('\n')
  const out: { title: string; body: string }[] = []
  let current: { title: string; body: string[] } | null = null

  const flush = () => {
    if (!current) return
    out.push({ title: current.title, body: current.body.join('\n').trim() })
    current = null
  }

  for (const line of lines) {
    const m = /^(#{1,6})\s+(.*)$/.exec(line)
    if (m && m[1].length === level) {
      flush()
      current = { title: m[2].trim(), body: [] }
      continue
    }
    if (current) current.body.push(line)
  }
  flush()
  return out
}

export function extractHashTags(text: string): string[] {
  const tags: string[] = []
  const re = /`#([a-zA-Z0-9_-]+)`/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) tags.push(m[1].toLowerCase())
  return [...new Set(tags)]
}

export function extractBracketTags(text: string): string[] {
  const tags: string[] = []
  const tick = /`\[([^\]]+)\]`/g
  let m: RegExpExecArray | null
  while ((m = tick.exec(text))) {
    for (const part of m[1].split(/[,\s]+/)) {
      const t = part.trim().toLowerCase()
      if (t) tags.push(t)
    }
  }
  const bare = /(?:^|\s)\[([a-z0-9/-]+)\]/gi
  while ((m = bare.exec(text))) tags.push(m[1].toLowerCase())
  return [...new Set(tags)]
}

export function stripHashTagsFromTitle(title: string): string {
  return title
    .replace(/`#[^`]+`/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractBlockquotes(md: string): string[] {
  const lines = md.split('\n')
  const runs: string[] = []
  let cur: string[] = []
  const flush = () => {
    if (cur.length === 0) return
    runs.push(
      cur
        .map((l) => l.replace(/^>\s?/, ''))
        .join('\n')
        .trim(),
    )
    cur = []
  }
  for (const line of lines) {
    if (line.startsWith('>')) cur.push(line)
    else flush()
  }
  flush()
  return runs.filter(Boolean)
}

export function parsePipeTables(md: string): { headers: string[]; rows: string[][] }[] {
  const lines = md.split('\n')
  const tables: { headers: string[]; rows: string[][] }[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i] ?? ''
    const next = lines[i + 1] ?? ''
    if (isTableRow(line) && isTableSep(next)) {
      const headers = splitTableRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && isTableRow(lines[i] ?? '')) {
        rows.push(splitTableRow(lines[i] ?? ''))
        i += 1
      }
      tables.push({ headers, rows })
      continue
    }
    i += 1
  }
  return tables
}

function isTableRow(line: string): boolean {
  const t = line.trim()
  return t.startsWith('|') && t.includes('|', 1)
}

function isTableSep(line: string): boolean {
  const t = line.trim()
  if (!t.startsWith('|')) return false
  return /^\|[\s:|-]+\|$/.test(t)
}

function splitTableRow(line: string): string[] {
  let inner = line.trim()
  if (inner.startsWith('|')) inner = inner.slice(1)
  if (inner.endsWith('|')) inner = inner.slice(0, -1)
  return inner.split('|').map((c) => stripCite(c).trim())
}

export function parseCheckboxes(md: string): {
  status: 'open' | 'doing' | 'done'
  title: string
  detail: string
}[] {
  const items: { status: 'open' | 'doing' | 'done'; title: string; detail: string }[] = []
  for (const raw of md.split('\n')) {
    const m = /^\s*[-*]\s+\[([ xX~])\]\s+(.*)$/.exec(raw)
    if (!m) continue
    const mark = m[1]
    const status = mark === '~' ? 'doing' : /x/i.test(mark) ? 'done' : 'open'
    const rest = m[2].trim()
    const bold = /^\*\*(.+?)\*\*\s*(.*)$/.exec(rest)
    if (bold) {
      items.push({
        status,
        title: bold[1].replace(/\.$/, '').trim(),
        detail: bold[2].trim(),
      })
    } else {
      items.push({ status, title: rest, detail: '' })
    }
  }
  return items
}

export function parseNumberedItems(md: string): { n: number; text: string }[] {
  const items: { n: number; text: string }[] = []
  const lines = md.split('\n')
  let i = 0
  while (i < lines.length) {
    const m = /^\s*(\d+)\.\s+(.*)$/.exec(lines[i] ?? '')
    if (!m) {
      i += 1
      continue
    }
    const n = Number(m[1])
    const parts = [m[2]]
    i += 1
    while (i < lines.length) {
      const line = lines[i] ?? ''
      if (!line.trim()) break
      if (/^\s*\d+\.\s+/.test(line)) break
      if (/^#{1,6}\s/.test(line)) break
      if (/^\s*[-*]\s+\[/.test(line)) break
      parts.push(line.trim())
      i += 1
    }
    items.push({ n, text: parts.join(' ').replace(/\s+/g, ' ').trim() })
  }
  return items
}

export function parseBoldFields(body: string): { key: string; value: string }[] {
  const lines = body.split('\n')
  const fields: { key: string; value: string }[] = []
  let current: { key: string; value: string[] } | null = null
  const flush = () => {
    if (!current) return
    fields.push({
      key: current.key,
      value: current.value.join('\n').trim(),
    })
    current = null
  }
  for (const line of lines) {
    const m = /^\*\*([^*]+)\*\*:?\s*(.*)$/.exec(line)
    if (m) {
      flush()
      current = { key: m[1].trim(), value: m[2] ? [m[2]] : [] }
      continue
    }
    if (current) current.value.push(line)
  }
  flush()
  return fields
}

export function fieldValue(
  fields: { key: string; value: string }[],
  aliases: string[],
): string {
  const want = aliases.map((a) => normKey(a))
  for (const f of fields) {
    const k = normKey(f.key)
    if (want.some((w) => k === w || k.startsWith(w))) return f.value.trim()
  }
  return ''
}

export function normKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function mapStarKey(key: string): 'situation' | 'task' | 'action' | 'result' | 'other' {
  const k = normKey(key)
  const first = k.split(' ')[0] ?? ''
  if (first === 's' || k.startsWith('situation')) return 'situation'
  if (first === 't' || k.startsWith('task')) return 'task'
  if (first === 'a' || k.startsWith('action')) return 'action'
  if (first === 'r' && (k === 'r' || k.startsWith('result') || k.startsWith('r result'))) {
    return 'result'
  }
  return 'other'
}

export function extractOpenGaps(md: string): string[] {
  const gaps: string[] = []
  const lines = md.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    if (!/\bOPEN\b/.test(line) && !/\*\*OPEN\b/.test(line)) continue
    const cleaned = line
      .replace(/\*\*/g, '')
      .replace(/^OPEN[—:\s-]*/i, '')
      .trim()
    const parts = cleaned ? [cleaned] : []
    let j = i + 1
    while (j < lines.length) {
      const next = lines[j] ?? ''
      if (!next.trim()) break
      if (/^#{1,6}\s/.test(next)) break
      if (/\*\*[A-Z]/.test(next) && !/\bOPEN\b/.test(next)) break
      if (/^\d+\.\s/.test(next) && parts.length > 0) break
      if (next.startsWith('>')) break
      parts.push(next.replace(/^\s*[-*]\s+/, '').trim())
      j += 1
      if (parts.join(' ').length > 400) break
    }
    const text = parts.join(' ').replace(/\s+/g, ' ').trim()
    if (text.length > 2) gaps.push(text)
  }
  return gaps
}

export function parseDraftStatus(text: string): DraftStatus | null {
  const m = /\bStatus:\s*([A-Z]+)/i.exec(text) ?? /\b(DRAFTED|OUTLINED|EMPTY|PROBING)\b/.exec(text)
  if (!m) return null
  const raw = (m[1] ?? '').toUpperCase()
  if (raw === 'DRAFTED') return 'drafted'
  if (raw === 'OUTLINED') return 'outlined'
  if (raw === 'PROBING') return 'probing'
  if (raw === 'EMPTY') return 'empty'
  return null
}
