import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { parseApplicationsMarkdown } from './src/careerOps/parseApplications'

function resolveApplicationsFile(careerRoot: string): string | null {
  const candidates = [
    path.join(careerRoot, 'applications.md'),
    path.join(careerRoot, 'data', 'applications.md'),
  ]
  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }
  return null
}

/** True if `child` is `parent` or a path under `parent` (after resolve). */
function isResolvedUnderParent(parentReal: string, childPath: string): boolean {
  const resolved = path.resolve(childPath)
  let childReal: string
  try {
    childReal = fs.realpathSync.native(resolved)
  } catch {
    childReal = resolved
  }
  const rel = path.relative(parentReal, childReal)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function careerOpsApiPlugin(careerOpsPathFromFile: string | undefined): Plugin {
  return {
    name: 'career-ops-applications-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url ?? ''
        const pathname = rawUrl.split('?')[0] ?? ''
        if (pathname !== '/api/career-ops/applications') {
          next()
          return
        }
        if (req.method !== 'GET') {
          next()
          return
        }

        const sendJson = (code: number, body: unknown) => {
          res.statusCode = code
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        const root =
          careerOpsPathFromFile?.trim() ||
          process.env.CAREER_OPS_PATH?.trim()
        if (!root) {
          sendJson(503, {
            error:
              'CAREER_OPS_PATH is not set. Add it to .env (see .env.example).',
          })
          return
        }

        let careerReal: string
        try {
          careerReal = fs.realpathSync.native(path.resolve(root))
        } catch {
          sendJson(503, {
            error: `CAREER_OPS_PATH directory not found or inaccessible: ${root}`,
          })
          return
        }

        const stat = fs.statSync(careerReal, { throwIfNoEntry: false })
        if (!stat?.isDirectory()) {
          sendJson(503, {
            error: `CAREER_OPS_PATH is not a directory: ${careerReal}`,
          })
          return
        }

        const appsFile = resolveApplicationsFile(careerReal)
        if (!appsFile) {
          sendJson(404, {
            error: `applications.md not found under ${careerReal} (tried applications.md and data/applications.md)`,
          })
          return
        }

        let appsReal: string
        try {
          appsReal = fs.realpathSync.native(path.resolve(appsFile))
        } catch {
          sendJson(500, { error: 'Could not resolve applications.md path' })
          return
        }

        if (!isResolvedUnderParent(careerReal, appsReal)) {
          sendJson(403, {
            error: 'applications.md path escapes CAREER_OPS_PATH',
          })
          return
        }

        let md: string
        try {
          md = fs.readFileSync(appsReal, 'utf8')
        } catch (e) {
          sendJson(500, {
            error: `Failed to read applications.md: ${e instanceof Error ? e.message : String(e)}`,
          })
          return
        }

        const applications = parseApplicationsMarkdown(md).map((app) => {
          if (!app.reportPath) {
            return { ...app, reportAbsolutePath: null as string | null }
          }
          // Tracker links are relative to the tracker file (e.g. ../reports/...
          // when applications.md lives in data/). Fall back to a career-ops
          // root-relative link for legacy rows.
          const fromTracker = path.resolve(path.dirname(appsReal), app.reportPath)
          let resolved = fromTracker
          if (!fs.existsSync(fromTracker)) {
            const legacy = path.resolve(careerReal, app.reportPath)
            if (fs.existsSync(legacy)) resolved = legacy
          }
          if (!isResolvedUnderParent(careerReal, resolved)) {
            return { ...app, reportAbsolutePath: null as string | null }
          }
          return { ...app, reportAbsolutePath: resolved }
        })

        sendJson(200, {
          applications,
          generatedAt: new Date().toISOString(),
          careerOpsPath: careerReal,
          applicationsFile: appsReal,
        })
      })
    },
  }
}

const MAX_PREP_FILES = 80
const MAX_PREP_FILE_BYTES = 1_500_000

function sendJson(res: ServerResponse, code: number, body: unknown) {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

function expandUserPath(input: string): string {
  const trimmed = input.trim()
  if (trimmed === '~') return os.homedir()
  if (trimmed.startsWith('~/')) return path.join(os.homedir(), trimmed.slice(2))
  return trimmed
}

function interviewPrepApiPlugin(defaultRootFromEnv: string | undefined): Plugin {
  return {
    name: 'interview-prep-files-api',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        const rawUrl = req.url ?? ''
        let url: URL
        try {
          url = new URL(rawUrl, 'http://vite.local')
        } catch {
          next()
          return
        }
        const pathname = url.pathname
        if (pathname !== '/api/interview-prep/files' && pathname !== '/api/interview-prep/meta') {
          next()
          return
        }
        if (req.method !== 'GET') {
          next()
          return
        }

        const suggestedRoot = defaultRootFromEnv?.trim() || ''

        if (pathname === '/api/interview-prep/meta') {
          sendJson(res, 200, { suggestedRoot })
          return
        }

        const requested = url.searchParams.get('root')?.trim() || suggestedRoot
        if (!requested) {
          sendJson(res, 400, {
            error:
              'Choose a folder path. Paste the absolute path to the directory that holds your prep markdown files.',
            suggestedRoot,
          })
          return
        }
        if (requested.includes('\0')) {
          sendJson(res, 400, { error: 'Invalid folder path.', suggestedRoot })
          return
        }

        const expanded = expandUserPath(requested)
        if (!path.isAbsolute(expanded)) {
          sendJson(res, 400, {
            error: 'Folder path must be absolute, for example /Users/you/Documents/interview-prep.',
            suggestedRoot,
          })
          return
        }

        let rootReal: string
        try {
          rootReal = fs.realpathSync.native(path.resolve(expanded))
        } catch {
          sendJson(res, 404, {
            error: `Folder not found or inaccessible: ${expanded}`,
            suggestedRoot,
          })
          return
        }

        const rootStat = fs.statSync(rootReal, { throwIfNoEntry: false })
        if (!rootStat?.isDirectory()) {
          sendJson(res, 400, {
            error: `Not a directory: ${rootReal}`,
            suggestedRoot,
          })
          return
        }

        let entries: fs.Dirent[]
        try {
          entries = fs.readdirSync(rootReal, { withFileTypes: true })
        } catch (e) {
          sendJson(res, 500, {
            error: `Could not read folder: ${e instanceof Error ? e.message : String(e)}`,
            suggestedRoot,
          })
          return
        }

        const mdEntries = entries
          .filter(
            (ent) =>
              ent.isFile() &&
              ent.name.toLowerCase().endsWith('.md') &&
              !ent.name.startsWith('.'),
          )
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

        if (mdEntries.length > MAX_PREP_FILES) {
          sendJson(res, 400, {
            error: `Too many markdown files in that folder (max ${MAX_PREP_FILES}).`,
            suggestedRoot,
          })
          return
        }

        const files: {
          name: string
          content: string
          mtimeMs: number
          bytes: number
        }[] = []
        const warnings: string[] = []

        for (const ent of mdEntries) {
          const abs = path.resolve(rootReal, ent.name)
          if (!isResolvedUnderParent(rootReal, abs)) {
            warnings.push(`Skipped ${ent.name}: path escaped the folder.`)
            continue
          }
          let st: fs.Stats
          try {
            st = fs.statSync(abs)
          } catch {
            warnings.push(`Skipped ${ent.name}: could not stat.`)
            continue
          }
          if (!st.isFile()) continue
          if (st.size > MAX_PREP_FILE_BYTES) {
            warnings.push(`Skipped ${ent.name}: larger than ${MAX_PREP_FILE_BYTES} bytes.`)
            continue
          }
          try {
            const content = fs.readFileSync(abs, 'utf8')
            files.push({
              name: ent.name,
              content,
              mtimeMs: st.mtimeMs,
              bytes: st.size,
            })
          } catch (e) {
            warnings.push(
              `Skipped ${ent.name}: ${e instanceof Error ? e.message : String(e)}`,
            )
          }
        }

        sendJson(res, 200, {
          root: rootReal,
          generatedAt: new Date().toISOString(),
          files,
          warnings,
          suggestedRoot,
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      careerOpsApiPlugin(env.CAREER_OPS_PATH),
      interviewPrepApiPlugin(env.INTERVIEW_PREP_PATH),
    ],
  }
})
