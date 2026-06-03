import { NEETCODE_150_SEEDS } from './data/neetcode150'
import { neetCodeCatalogId } from './utils/mergeNeetCode150'
import type {
  AppData,
  CodingProblem,
  LinkItem,
  StoryCard,
  CodingConfidence,
  SystemTopic,
  SystemTopicTier,
} from './types'

const id = () => crypto.randomUUID()

const PITCH_SCRIPT = `I'm a Senior Software Engineer currently at Metrolinx — which is a Crown corporation that runs GO Transit and UP Express in Ontario, so real production infrastructure with real operational consequences. I was originally brought in through a vendor called ONxpress on a $1.6B rail operations project, and when that wrapped up Metrolinx brought me on directly.

My core work has been end-to-end ownership of complex backend integrations — most notably a real-time secure data exchange between Metrolinx and CN Rail, built on Azure Container Apps with event-driven architecture using RabbitMQ. I've also built data pipelines and led technical direction on internal operations platforms.

I'm drawn to platform and backend engineering because I like owning problems end-to-end — from the first architecture decision through to production monitoring. I'm looking to bring that into a product company where the engineering challenges are closer to the core of the business.`

const NOTES_CN_RAIL = `WHAT IT IS:
End-to-end ownership of a secure, real-time data exchange between Metrolinx and Canadian National Railway (CN Rail). Two large organizations that were not designed to talk to each other. Built entirely on Azure.

TECHNICAL DETAILS:
- 3 migrated + 2 net-new containerized microservices on Azure Container Apps
- Event-driven architecture using RabbitMQ: 20 queues, 10 consumers
- Azure API Management for the external-facing layer
- Real-time rail data at 10–30 second polling intervals
- Logging structure defined from scratch using Application Insights
- Alerting thresholds and observability standards set by Baz
- CI/CD migrated from manual on-prem to GitHub Actions
- Target: 99.9% uptime

SCOPE OF OWNERSHIP:
- First architecture decision through to production monitoring
- Led all technical decisions end-to-end
- Coordinated directly with CN Rail as external stakeholder
- Authored internal documentation for the platform integration
- Mentored a struggling colleague throughout

OUTCOME:
- 25% reduction in production incidents
- System running reliably in production

HOW TO FRAME IT:
Do NOT say: "I built a data integration between two rail companies"
DO say: "I owned the full architecture and delivery of a secure, real-time data exchange between two large organizations — Metrolinx and CN Rail — that weren't designed to talk to each other. Containerized microservices on Azure Container Apps, event-driven messaging through RabbitMQ, API Management for the external layer. I defined the observability standards, set up alerting, and took it from first architecture decision through to production monitoring."

WHY IT MATTERS FOR INTERVIEWS:
This is a real system design problem Baz already solved in production. Use it as an anchor when system design topics come up. It demonstrates:
- Distributed systems experience (RabbitMQ, microservices)
- Azure expertise (Container Apps, API Management, App Insights)
- Cross-org technical coordination (CN Rail as external party)
- Production reliability thinking (uptime targets, alerting, monitoring)
- End-to-end ownership, not just implementation

COMMON QUESTIONS IT ANSWERS:
- "Walk me through a complex technical problem you owned end to end"
- "Tell me about a system you designed from scratch"
- "How do you approach observability and reliability?"
- "Tell me about a time you led a technical initiative"
- "Describe a situation where you performed best"`

const NOTES_ENABLON = `WHAT IT IS:
Integrated Enablon — a third-party EHS (Environmental Health & Safety) system — into Metrolinx's Azure Data Lake. The challenge: Enablon had no modern API surface, only legacy SOAP endpoints.

TECHNICAL DETAILS:
- Azure Function handling the transformation and delivery
- SOAP endpoint consumption → normalized data → Azure Data Lake
- Part of a broader Azure data platform spanning 3 source systems
- The pipeline powers 20+ operational reports

SCOPE OF OWNERSHIP:
- Designed and built the integration solo
- This work was under ONxpress (the vendor through which Baz originally joined the Metrolinx project), not directly under Metrolinx
- Part of a 4-person engineering team at ONxpress

OUTCOME:
- Unblocked the entire data platform initiative for the team
- 20+ operational reports now running on this data

HOW TO FRAME IT:
Do NOT say: "I built an Azure Function that pulls SOAP data into a Data Lake"
DO say: "We had a third-party system with no modern API surface — just SOAP endpoints — and we needed that data flowing into our Data Lake reliably. I designed and built the Azure Function that handled transformation and delivery end-to-end. It unblocked the whole data platform initiative and now powers over 20 operational reports."

WHY IT MATTERS FOR INTERVIEWS:
Shows ability to work with legacy systems and build pragmatic integrations under real constraints. Demonstrates Azure Functions, data pipeline thinking, and the problem → decision → impact framing clearly.

COMMON QUESTIONS IT ANSWERS:
- "Tell me about a technical challenge you had to work around"
- "How do you deal with third-party systems you don't control?"
- "Tell me about a project that had outsized impact on the team"`

const NOTES_SCATTR = `WHAT IT IS:
A B2B SaaS product Baz built and launched as a solo engineer. Now inactive, but represents full end-to-end product ownership outside of an employer context.

TECHNICAL DETAILS:
- Built in Node.js and TypeScript
- Targeted QMS / compliance use case (businesses pay for this category)
- Baz handled architecture, development, and deployment solo

SCOPE OF OWNERSHIP:
- Everything: product decisions, architecture, infrastructure, deployment
- No team, no manager, no tickets — fully self-directed

WHY IT MATTERS FOR INTERVIEWS:
Most engineers at Baz's level have never shipped a product independently. This signals entrepreneurial thinking, full-stack ownership, and the ability to make decisions without guidance. Use it when asked about side projects, self-direction, or product thinking.

HOW TO FRAME IT:
Do NOT say: "I built a SaaS app on the side"
DO say: "I built and shipped a B2B SaaS product independently — handled everything from architecture through deployment. It's no longer active, but the experience of owning every layer of a product — including the parts that have nothing to do with code — gave me a different perspective on engineering decisions."

NOTE ON POSITIONING:
Baz is not targeting AI/ML roles. Scattr is not a strong signal for those. Best used for: product companies that value engineers who think beyond their ticket, or when asked about initiative and self-direction.

COMMON QUESTIONS IT ANSWERS:
- "Tell me about a project you're proud of outside of work"
- "Have you ever had full ownership of a product?"
- "How do you make decisions without clear requirements?"`

const NOTES_PITCH = `THE FULL SCRIPT (verbatim, memorize this — also in STAR):

${PITCH_SCRIPT}

KEY FRAMING NOTES:
- Always name the $1.6B project context — it reframes Metrolinx immediately
- "Crown corporation" signals public accountability without saying "government"
- "Real operational consequences" distinguishes from typical government IT
- End with what you're looking for — not "a new challenge" (generic), but "a product company where engineering is closer to the core"
- Tailor the last sentence per company. For 1Password: add "especially one working in the identity and security space." For Wealthsimple: "especially one where the product is the business, not a support function."

TIMING: Target 60–75 seconds. Practice out loud, not in your head.

COMMON MISTAKES TO AVOID:
- Don't start with "So basically..." — start with "I'm a Senior Software Engineer"
- Don't apologize for Metrolinx being government — frame it, don't hedge it
- Don't list technologies without context — always attach them to a problem you solved`

function storyCard(
  partial: Omit<
    StoryCard,
    'id' | 'status' | 'notes' | 'practiceCount' | 'lastPracticedDay'
  > & {
    status?: StoryCard['status']
    notes?: string
    practiceCount?: number
    lastPracticedDay?: string | null
  },
): StoryCard {
  return {
    id: id(),
    status: partial.status ?? 'not_practiced',
    notes: partial.notes ?? '',
    title: partial.title,
    context: partial.context,
    star: partial.star,
    practiceCount: partial.practiceCount ?? 0,
    lastPracticedDay: partial.lastPracticedDay ?? null,
  }
}

function coding(
  partial: Omit<
    CodingProblem,
    'id' | 'notes' | 'confidence' | 'practiceCount' | 'lastPracticedDay'
  > & {
    confidence?: CodingConfidence
    practiceCount?: number
    lastPracticedDay?: string | null
    notes?: string
    lcSlug?: string
  },
): CodingProblem {
  return {
    id: id(),
    confidence: partial.confidence ?? 'not_practiced',
    practiceCount: partial.practiceCount ?? 0,
    lastPracticedDay: partial.lastPracticedDay ?? null,
    notes: partial.notes ?? '',
    pattern: partial.pattern,
    title: partial.title,
    lcNumber: partial.lcNumber,
    difficulty: partial.difficulty,
    lcSlug: partial.lcSlug,
  }
}

function topic(
  partial: Omit<
    SystemTopic,
    'id' | 'status' | 'notes' | 'practiceCount' | 'lastPracticedDay'
  > & {
    status?: SystemTopic['status']
    notes?: string
    practiceCount?: number
    lastPracticedDay?: string | null
    tier?: SystemTopicTier
  },
): SystemTopic {
  return {
    id: id(),
    status: partial.status ?? 'not_started',
    notes: partial.notes ?? '',
    title: partial.title,
    practiceCount: partial.practiceCount ?? 0,
    lastPracticedDay: partial.lastPracticedDay ?? null,
    ...(partial.tier !== undefined ? { tier: partial.tier } : {}),
  }
}

function resource(
  label: string,
  url: string,
  note?: string,
): LinkItem {
  return { id: id(), label, url, ...(note ? { note } : {}) }
}

function link(label: string, url: string): LinkItem {
  return { id: id(), label, url }
}

export function createDefaultData(): AppData {
  return {
    darkMode: false,
    positioningStatement:
      'Senior platform and backend engineer with end-to-end ownership of secure, real-time data integrations between enterprise systems, in Azure, at scale.',
    storyCards: [
      storyCard({
        title: 'CN Rail Real-Time Data Integration',
        context: 'Metrolinx, Azure, RabbitMQ, Container Apps',
        star: 'Built a secure real-time data integration between Metrolinx and CN Rail. Designed containerized microservices with event-driven architecture using RabbitMQ. Runs in production with real operational consequences.',
        notes: NOTES_CN_RAIL,
      }),
      storyCard({
        title: 'Enablon Azure Data Platform Pipeline',
        context: 'Metrolinx, Azure Functions, SOAP, Data Lake',
        star: 'Integrated a third-party EHS system with no modern API surface into the Azure Data Lake via an Azure Function handling transformation and delivery.',
        notes: NOTES_ENABLON,
      }),
      storyCard({
        title: 'Scattr — B2B SaaS Product',
        context: 'Side project, Node.js, TypeScript',
        star: 'Built and launched a B2B SaaS product end-to-end as a solo engineer. Architecture through deployment, gained firsthand product and technical ownership experience.',
        notes: NOTES_SCATTR,
      }),
      storyCard({
        title: 'Pitch: Tell me about yourself',
        context: 'Opening question, 60 second pitch',
        star: PITCH_SCRIPT,
        notes: NOTES_PITCH,
      }),
    ],
    storyLinks: [
      link('LinkedIn', 'https://www.linkedin.com/'),
      link('Portfolio', 'https://'),
      link('GitHub', 'https://github.com/'),
    ],
    codingProblems: NEETCODE_150_SEEDS.map((seed) => ({
      ...coding(seed),
      id: neetCodeCatalogId(seed.lcNumber),
    })),
    systemTopics: [
      topic({ title: 'Rate limiter', tier: 1 }),
      topic({ title: 'Authentication / OAuth system', tier: 1 }),
      topic({ title: 'URL shortener', tier: 1 }),
      topic({ title: 'Notification system', tier: 1 }),
      topic({ title: 'API gateway', tier: 1 }),
      topic({ title: 'Chat system', tier: 2 }),
      topic({ title: 'Key-value store', tier: 2 }),
      topic({ title: 'Distributed job scheduler', tier: 2 }),
      topic({ title: 'Metrics and alerting platform', tier: 2 }),
      topic({ title: 'Search autocomplete', tier: 2 }),
      topic({ title: 'YouTube / Netflix', tier: 3 }),
      topic({ title: 'Distributed transaction system', tier: 3 }),
      topic({ title: 'Google Maps', tier: 3 }),
    ],
    systemChecklistDone: [],
    systemResources: [
      resource(
        'Alex Xu — System Design Interview Vol 1',
        'https://www.amazon.com/s?k=system+design+alex+xu+vol+1',
        'Spine: do every Tier 1 and Tier 2 problem that has a chapter.',
      ),
      resource(
        'Hello Interview',
        'https://www.hellointerview.com/',
        'Structured walkthroughs and AI mock interviews.',
      ),
      resource(
        'ByteByteGo',
        'https://bytebytego.com',
        'Short concept videos during lunch.',
      ),
      resource(
        'Alex Xu — Vol 2',
        'https://www.amazon.com/s?k=system+design+alex+xu+vol+2',
        'After the relevant Vol 1 chapters; harder depth.',
      ),
      resource(
        'Designing Data-Intensive Applications (Kleppmann)',
        'https://www.amazon.com/s?k=designing+data-intensive+applications',
        'Parallel track over a few months — databases, queues, replication for real depth.',
      ),
    ],
    sessionLog: [],
    practiceEvents: [],
  }
}
