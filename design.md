# Senior Software Prep Dashboard: backend design

Status: proposed  
Audience: backend and frontend engineers  
Last updated: 2026-07-22

## Summary

The dashboard tracks interview preparation across behavioral stories, coding problems, system-design practice, and a career application pipeline.

Today, the prep data is stored as one JSON document in browser `localStorage`. The career pipeline is read from another repository by a Vite development-server plugin. This works on one browser, but it does not provide authentication, cross-device sync, durable backups, or a production career API.

The backend should:

- authenticate a user and isolate all user-owned data;
- persist prep data as structured records rather than one mutable JSON blob;
- record practice and status changes atomically;
- expose the career pipeline through a read-only integration;
- support a one-time import of the current `localStorage` snapshot;
- preserve the frontend's existing scoring and system-design confidence rules.

This document is technology-neutral. Endpoint examples use REST and JSON, but the data model and invariants apply if the backend uses another transport.

## Product behavior to preserve

### Dashboard

The home screen shows:

- readiness percentages for story, coding, and system design;
- the number of coding problems attempted;
- a consecutive-day practice streak;
- a reverse-chronological practice log grouped by the user's local calendar day.

Readiness is a weighted average, rounded to the nearest integer:

- story: `not_practiced = 0`, `needs_work = 0.5`, `confident = 1`;
- coding: `not_practiced = 0`, `needs_work = 0.5`, `almost_there = 0.75`, `confident = 1`;
- system design: `not_started = 0`, `studied = 0.5`, `confident = 1`.

The score for a track with no items is `0`.

### Behavioral stories

A user can:

- edit a positioning statement;
- create, edit, and delete story cards;
- store a title, context, STAR narrative, and notes on each card;
- cycle a card through `not_practiced`, `needs_work`, and `confident`;
- log practice and see the practice count and most recent local practice day;
- manage related links.

### Coding practice

The frontend ships with a coding catalog based on NeetCode 150 plus a small supplemental set. Catalog problems use LeetCode number as the durable natural key.

A user can:

- keep progress and notes for catalog problems;
- add and delete custom problems;
- cycle confidence through `not_practiced`, `needs_work`, `almost_there`, and `confident`;
- log attempts;
- filter by difficulty and confidence;
- see progress by pattern and across the full set;
- receive up to three suggestions.

Suggestion order is:

1. the first not-practiced problem in roadmap order;
2. up to two `needs_work` or `almost_there` reviews, with `needs_work` first and the stalest practice date first;
3. more not-practiced problems until the requested limit is reached.

Roadmap order is pattern order, then `Easy`, `Medium`, `Hard`, then LeetCode number.

### System design

System-design topics may be normal practice topics or personal production case studies. Practice topics can have a priority tier from 1 through 3.

A user can:

- create, edit, and delete topics;
- store notes;
- log `solo`, `solo_timed`, or `mock` attempts;
- cycle status through `not_started`, `studied`, and `confident`;
- complete stable checklist task IDs supplied by the frontend;
- manage ranked study resources.

The backend must reject `confident` unless the topic has at least one `solo_timed` or `mock` attempt. A plain `solo` attempt does not satisfy this gate.

The frontend warns when no mock exists or the latest mock is at least 14 local calendar days old. That warning can remain client-derived.

### Career pipeline

The career screen is read-only. It displays application records, summary counts, filters, sorting, PDF availability, and report paths.

The current source is an `applications.md` table in the separate `career-ops` repository. A production backend may continue parsing that file or consume a structured source from career-ops. The API response should not expose absolute server filesystem paths.

## Current implementation

Prep state is stored under `interview-prep-v1` as one `AppData` object. A best-known coding snapshot is also kept under `interview-prep-v1-backup`. Every React state change rewrites the full document.

The browser creates UUIDs and ISO timestamps. It also stores `YYYY-MM-DD` local-day values because streaks and practice dates are calendar-day concepts, not UTC-day concepts.

The career endpoint, `GET /api/career-ops/applications`, exists only inside the Vite dev server. It reads a local checkout path from `CAREER_OPS_PATH`, parses Markdown, and returns absolute file paths for reports.

There is no authentication, remote sync, or automated test suite in this repository.

These behaviors are useful migration inputs, not the target persistence architecture.

## Proposed architecture

The frontend talks to one authenticated backend API. The API owns validation, authorization, persistence, event creation, and the system-confidence rule.

The backend has two logical modules:

1. Prep service: user profile, stories, coding progress, system-design progress, resources, checklist completion, attempts, and activity.
2. Career adapter: a read-only boundary around career-ops data.

A relational database is the default recommendation. The data has clear ownership, uniqueness rules, and transactional updates. PostgreSQL is a good fit, but no PostgreSQL-specific behavior is required by this contract.

Static catalogs should stay separate from user progress:

- coding problem definitions can remain versioned in the frontend at first, or move to a shared backend catalog later;
- system checklist labels and study-plan copy can remain frontend-owned;
- the backend stores user progress against stable catalog keys;
- personal story content and personal case studies are user data, not global seed data.

## Authentication and ownership

All prep endpoints require an authenticated user. The backend obtains the user ID from the verified session or access token; it must never trust a `userId` in a request body.

Every user-owned record carries `user_id`. Reads, updates, and deletes must include that ownership constraint. UUID knowledge must not grant access to another user's record.

The initial deployment can support one user, but the schema should still include ownership from day one. Adding ownership later is a risky migration and makes authorization easier to miss.

Recommended profile fields:

```text
user_id
positioning_statement
timezone              IANA name, for example America/Toronto
dark_mode
created_at
updated_at
version
```

The timezone is required for server-generated local practice days. If it is missing, the client must send `localDay` when logging an attempt. The server should validate it against the event timestamp and an allowed clock-skew window.

## Data model

All IDs are UUIDs unless a catalog key is explicitly named. All timestamps are ISO 8601 UTC values in the API and timezone-aware timestamps in storage. Mutable records include `created_at`, `updated_at`, and a monotonic `version`.

### Story card

```text
id
user_id
title                  non-empty
context
star_narrative
notes
status                 not_practiced | needs_work | confident
legacy_practice_count  nullable; import compatibility only
legacy_last_day        nullable; import compatibility only
created_at
updated_at
version
deleted_at             nullable
```

### Story link

```text
id
user_id
label
url
sort_order
created_at
updated_at
version
```

The API should accept only `http` and `https` URLs. Empty frontend placeholders such as `https://` should be rejected with a validation error.

### Coding problem definition

```text
id
owner_user_id          null for shared catalog rows, set for custom rows
catalog_key            nullable, for example neetcode150-1
leetcode_number
leetcode_slug          nullable
title
pattern
difficulty             Easy | Medium | Hard
catalog_sort_order     nullable
active
created_at
updated_at
```

Constraints:

- shared `catalog_key` is unique;
- a shared LeetCode number is unique within the catalog;
- a user's custom problems should be unique by `(owner_user_id, leetcode_number)` unless duplicate tracking is an intentional product decision.

### Coding progress

```text
id
user_id
problem_id
confidence             not_practiced | needs_work | almost_there | confident
notes
legacy_practice_count  nullable; import compatibility only
legacy_last_day        nullable; import compatibility only
created_at
updated_at
version
```

`(user_id, problem_id)` is unique. Attempt count and latest practice day are derived from attempt records, with imported legacy values used only when no equivalent historical attempts exist.

### System topic

```text
id
user_id
title                  non-empty
status                 not_started | studied | confident
tier                    nullable, otherwise 1 | 2 | 3
kind                    practice | case_study
notes
catalog_key             nullable
legacy_practice_count  nullable; import compatibility only
legacy_last_day        nullable; import compatibility only
created_at
updated_at
version
deleted_at             nullable
```

If the backend owns a shared system-topic catalog later, `catalog_key` links progress to it. For the first release, materialized user topics are acceptable.

### Practice attempt

```text
id
user_id
track                   story | coding | system
story_card_id           nullable
coding_progress_id      nullable
system_topic_id         nullable
kind                    nullable for story/coding;
                        solo | solo_timed | mock for system
occurred_at             UTC timestamp
local_day               YYYY-MM-DD
source                  web | import | admin
idempotency_key         nullable
created_at
```

Exactly one target foreign key must be set and must match `track`. Attempts are append-only in the normal API.

### Activity event

```text
id
user_id
occurred_at
local_day
track                   story | coding | system | system_checklist
event_type              status_changed | attempt_logged | checklist_completed
subject_id              nullable
subject_label_snapshot
from_value              nullable
to_value                nullable
metadata_json
source
created_at
```

Activity is append-only. `subject_label_snapshot` preserves useful history if the source item is renamed or deleted. The current frontend caps activity at 500 entries because it stores everything in one browser document. The backend should retain events and paginate them instead of deleting older records.

### Checklist completion

```text
user_id
task_id
completed_at
local_day
version
```

`(user_id, task_id)` is unique. Task IDs come from the versioned frontend checklist. Unknown IDs may be stored to avoid losing progress during staggered deployments, but the API should apply a length limit.

### Resource link

```text
id
user_id
track                   story | system
label
url
note                    nullable
sort_order
created_at
updated_at
version
```

This can replace separate story-link and system-resource tables if the team prefers one polymorphic resource model.

### Career application read model

```text
external_id
number
date
company
role
score_raw
score                  nullable decimal
status
has_pdf
report_id              nullable
report_display_path    nullable
notes
source_updated_at      nullable
```

`external_id` must be stable across refreshes. If career-ops cannot supply one, derive it from a documented immutable source field. Do not use a row index as the only identity if rows can be reordered.

## Write semantics and invariants

### Status update

A status update and its `status_changed` activity event must commit in one transaction. If the status did not change, no event is created.

For a system topic, the transaction also checks for a `solo_timed` or `mock` attempt before accepting `confident`. A rejected request returns `409 SYSTEM_TOPIC_PRESSURE_ATTEMPT_REQUIRED`.

### Attempt logging

Attempt logging must be a dedicated command, not a generic count patch.

In one transaction, the backend:

1. validates ownership of the target;
2. inserts the attempt;
3. inserts the matching activity event;
4. returns the new attempt count and latest local practice day.

The request accepts an idempotency key. Repeating the same request with the same user and key returns the original result without inserting another attempt.

Practice counts are derived from attempts. Clients should not send an absolute count during normal operation.

The current story screen can decrement its counter. The target API should not silently erase an attempt. Either remove that control in the frontend or add an explicit "undo latest attempt" operation with an audit event. Hard-deleting arbitrary history is not recommended.

### Deletion

Story cards and system topics should use soft deletion so their activity remains intelligible. Custom coding problems may also use soft deletion. Deleting a shared catalog problem means hiding or archiving the user's progress, not deleting the global definition.

Resource links can be hard-deleted if no audit requirement exists.

### Concurrency

Mutable resources expose `version`. Update and delete requests include `expectedVersion`.

If the stored version differs, return `409 VERSION_CONFLICT` with the current resource. This prevents silent last-write-wins data loss when two tabs or devices edit notes.

The frontend currently saves on every keystroke. Before using the API it should debounce text updates and handle version conflicts. Status changes and attempt logging should not be debounced.

## API contract

All success responses include a `requestId`. Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title must not be empty",
    "fields": {
      "title": "required"
    }
  },
  "requestId": "..."
}
```

### Bootstrap

`GET /v1/prep/bootstrap`

Returns the authenticated user's profile, story cards, links, coding progress, custom coding definitions, system topics, checklist completions, and resources. Shared catalogs may be returned here if the backend owns them.

This endpoint is for initial page load. Large activity history and career applications are fetched separately.

Recommended response metadata:

```json
{
  "schemaVersion": 1,
  "serverTime": "2026-07-22T23:00:00.000Z",
  "data": {}
}
```

### Profile

- `PATCH /v1/prep/profile`
  - updates `positioningStatement`, `timezone`, or `darkMode`;
  - requires `expectedVersion`.

### Stories

- `POST /v1/prep/stories`
- `PATCH /v1/prep/stories/{storyId}`
- `DELETE /v1/prep/stories/{storyId}`
- `POST /v1/prep/stories/{storyId}/attempts`
- `POST /v1/prep/resources` with `track = story`
- `PATCH /v1/prep/resources/{resourceId}`
- `DELETE /v1/prep/resources/{resourceId}`

Story create requires `title`; other text fields may be empty.

### Coding

- `GET /v1/prep/coding/problems`
- `POST /v1/prep/coding/problems` for a custom problem
- `PATCH /v1/prep/coding/problems/{problemId}` for a custom definition
- `DELETE /v1/prep/coding/problems/{problemId}` for a custom definition or user archive
- `PUT /v1/prep/coding/problems/{problemId}/progress`
- `POST /v1/prep/coding/problems/{problemId}/attempts`

Progress update accepts `confidence`, `notes`, and `expectedVersion`. A confidence change creates activity; a notes-only update does not.

### System design

- `POST /v1/prep/system-topics`
- `PATCH /v1/prep/system-topics/{topicId}`
- `DELETE /v1/prep/system-topics/{topicId}`
- `POST /v1/prep/system-topics/{topicId}/attempts`
- `PUT /v1/prep/system-checklist/{taskId}` to mark complete
- `DELETE /v1/prep/system-checklist/{taskId}` to mark incomplete
- `POST /v1/prep/resources` with `track = system`

Attempt body:

```json
{
  "kind": "solo_timed",
  "occurredAt": "2026-07-22T23:00:00.000Z",
  "localDay": "2026-07-22",
  "idempotencyKey": "client-generated-uuid"
}
```

### Dashboard activity

`GET /v1/prep/activity?cursor=...&limit=50`

Returns reverse-chronological activity and a cursor. The client groups events by `localDay`. A `from` and `to` local-day filter may be added later.

`GET /v1/prep/summary`

This endpoint is optional. It can return readiness, attempted coding count, latest mock day, and streak. The first frontend integration may continue deriving these values from bootstrap data. If both client and server calculate them, contract tests must use the same fixtures to prevent drift.

### Career

`GET /v1/career/applications`

The first release can return all rows because the current tracker is small and the frontend already filters and sorts locally. Add server-side query parameters only when row count or latency justifies them.

Response:

```json
{
  "applications": [
    {
      "externalId": "career-ops:123",
      "number": 123,
      "date": "2026-07-22",
      "company": "Example",
      "role": "Senior Software Engineer",
      "scoreRaw": "4.2/5",
      "score": 4.2,
      "status": "Applied",
      "hasPdf": true,
      "reportId": "123",
      "reportDisplayPath": "reports/123-example.md",
      "notes": ""
    }
  ],
  "sourceUpdatedAt": "2026-07-22T23:00:00.000Z",
  "generatedAt": "2026-07-22T23:00:01.000Z"
}
```

If reports need to be downloadable later, add an authenticated endpoint such as `GET /v1/career/reports/{reportId}`. Do not return a server absolute path and do not accept an arbitrary filesystem path from the client.

## Local snapshot migration

The migration must be explicit because the current browser may contain progress that exists nowhere else.

### Endpoint

`POST /v1/prep/imports/local-storage`

Request:

```json
{
  "schemaVersion": 1,
  "sourceKey": "interview-prep-v1",
  "snapshot": {},
  "dryRun": true
}
```

The import flow is:

1. The frontend reads `interview-prep-v1` and offers the user an import.
2. It first sends `dryRun: true`.
3. The backend validates and returns counts, warnings, and the proposed merge.
4. The user confirms.
5. The frontend sends the same payload with `dryRun: false` and an idempotency key.
6. The frontend keeps the local snapshot until it has reloaded and verified backend data.

### Merge rules

- Match coding catalog progress by LeetCode number, not the browser UUID.
- Keep custom coding problems that do not match a catalog number.
- Map legacy coding statuses as follows: `not_started` to `not_practiced`, `attempted` to `needs_work`, and `solved` to `confident`. For `attempted` or `solved`, use a legacy count of 1 when the snapshot has no valid count.
- Preserve valid story and system UUIDs when they do not collide; otherwise issue new IDs and return an ID map.
- Match seeded system topics by normalized title only during import.
- Preserve notes and the highest known confidence when duplicate coding records exist.
- Import typed system attempts as attempts.
- When only a legacy count exists, store it in the legacy fields rather than inventing exact historical timestamps.
- Import practice events as `source = import`, deduplicated by original event ID.
- Preserve legacy session-log notes as imported activity or a separate legacy-note record so streak history remains unchanged.
- Ignore malformed records and report each warning; do not fail the whole import unless the top-level snapshot is invalid.
- Importing the same snapshot twice must not duplicate attempts or activity.

The backend should store an import checksum and the authenticated user ID. A repeated checksum returns the earlier import result.

## Career-ops integration

There are three viable source adapters:

1. Preferred: career-ops exposes a structured authenticated API.
2. Acceptable first release: the backend has read-only access to a mounted or checked-out `applications.md`.
3. Batch option: career-ops publishes normalized JSON to object storage or the backend database.

The parser must remain isolated behind an adapter interface. Markdown formatting is a storage detail and should not leak into the public API.

For file-based ingestion:

- configure the source root outside the web root;
- resolve and canonicalize paths;
- reject symlink or `..` escapes;
- read only the expected tracker file;
- never expose the configured root or absolute paths;
- cache the parsed result using file modification time;
- retain the last good result if a later parse fails, while marking it stale;
- emit metrics and structured logs for parse failures and row counts.

## Validation limits

The backend should enforce conservative limits and return field-level errors. Initial recommendations:

- title, label, company, role, pattern: 200 characters;
- context and status text from external sources: 500 characters;
- notes and STAR narrative: 50,000 characters;
- positioning statement: 5,000 characters;
- URL: 2,048 characters and `http` or `https`;
- task ID and catalog key: 200 characters;
- activity page size: default 50, maximum 200;
- import body: maximum 10 MB.

Reject unknown enum values. Normalize surrounding whitespace where blank values are not meaningful, but do not rewrite user-authored narrative or notes.

## Security and privacy

Story narratives, notes, positioning text, and career records may contain personal employment information. Treat them as private user data.

Required controls:

- TLS in transit and encryption at rest;
- user-scoped authorization on every prep query;
- no private text in routine application logs;
- redaction of request bodies in error reporting;
- bounded request sizes and rate limits on writes and imports;
- parameterized database access;
- strict URL and enum validation;
- audit fields for imports and destructive operations;
- backup and restore procedures tested before removing the browser-only fallback.

If report downloads are added, authorize by report ID and stream only files produced by the career adapter. Prevent path traversal and set a safe content type and disposition.

## Reliability and observability

The API should emit:

- request count, latency, and error rate by route;
- database transaction failures;
- version-conflict count;
- idempotency replays;
- import success, warning, and failure counts;
- career source age, parse duration, parse failures, and row count.

Every response and structured log includes a request ID. Health checks should distinguish API process health from career-source freshness so a missing career file does not take down prep tracking.

Transactional writes are required for attempts and status changes. Daily backups and a documented restore test are sufficient for the first release.

## Frontend integration plan

### Phase 1: backend foundation

- Add authentication and the user-owned schema.
- Implement bootstrap, profile, stories, coding progress, system topics, checklist, resources, attempts, and activity.
- Add contract tests for enums, confidence gating, event creation, ownership, version conflicts, and idempotency.

### Phase 2: safe migration

- Add dry-run and commit import endpoints.
- Add a frontend import screen that previews counts and warnings.
- Compare backend bootstrap data with the local snapshot before marking migration complete.
- Keep the local snapshot as a temporary read-only recovery copy.

### Phase 3: frontend cutover

- Replace context mutations with API commands and a query cache.
- Debounce narrative and notes updates.
- Keep optimistic updates for low-risk edits, but roll back on errors.
- Use dedicated attempt endpoints instead of changing counters.
- Handle `409 VERSION_CONFLICT` and `SYSTEM_TOPIC_PRESSURE_ATTEMPT_REQUIRED`.

### Phase 4: career API

- Implement the career adapter in the backend repository.
- Change the frontend from the Vite-only endpoint to `/v1/career/applications`.
- Stop displaying server absolute paths.
- Remove the Vite filesystem plugin after the production endpoint is verified.

### Phase 5: retire browser persistence

- Stop writing active state to `interview-prep-v1`.
- Keep an export command or downloadable JSON backup for user-controlled recovery.
- Remove local recovery code only after production backups and restore have been exercised.

## Test plan

Backend tests should cover:

- one user cannot read or mutate another user's records;
- retries with the same idempotency key create one attempt and one event;
- a status update and event either both commit or both roll back;
- system `confident` is rejected without a timed or mock attempt;
- a timed or mock attempt permits `confident`;
- stale `expectedVersion` values return a conflict without overwriting data;
- coding progress is unique per user and problem;
- imported coding progress matches by LeetCode number;
- repeated imports do not duplicate data;
- malformed import records produce warnings and do not erase valid records;
- streak grouping respects the stored local day around UTC midnight and daylight-saving changes;
- career parsing handles missing scores, missing reports, extra notes columns, and malformed rows;
- career responses never contain absolute server paths.

Frontend/backend contract fixtures should verify readiness percentages, coding suggestions, mock cadence, and activity grouping.

## Decisions needed before implementation

1. Authentication provider and token format.
2. Whether shared coding and system catalogs live in the backend or remain versioned in the frontend for the first release.
3. Whether career-ops can expose a structured API or must be read from a file.
4. Whether users may undo attempts, and what audit behavior that requires.
5. Retention policy for activity, soft-deleted records, and imported legacy data.
6. Whether the backend computes dashboard summaries in the first release or the client continues to derive them.

None of these decisions block schema prototyping except authentication identity shape and catalog ownership.

## Acceptance criteria

The backend cutover is complete when:

- an authenticated user sees the same prep content and progress on two browsers;
- imported local data survives refresh, sign-out, and sign-in;
- practice logging produces one attempt and one activity entry per user action;
- readiness and streak values match the current frontend for the same fixture;
- system confidence cannot bypass the pressure-tested-attempt rule;
- concurrent edits are detected instead of silently overwritten;
- career applications load outside the Vite development server;
- no API response exposes a server filesystem path;
- backup restoration has been tested successfully.
