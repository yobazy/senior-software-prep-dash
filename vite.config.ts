import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
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
          const abs = path.resolve(careerReal, app.reportPath)
          const rel = path.relative(careerReal, abs)
          if (rel.startsWith('..') || path.isAbsolute(rel)) {
            return { ...app, reportAbsolutePath: null as string | null }
          }
          return { ...app, reportAbsolutePath: abs }
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      careerOpsApiPlugin(env.CAREER_OPS_PATH),
    ],
  }
})
