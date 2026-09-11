# Reps — theme mapping

Overrides for the iOS app. Everything else comes from `../MASTER.md`.

Reps is the same product language on a smaller surface: pine on paper, clay for coding actions, San Francisco if Plus Jakarta is not bundled.

## What to copy

From `src/theme/tokens.ts` in the dashboard repo:

- `light` / `dark` semantic objects
- `pine`, `clay`, `ink` scales
- `space`, `radius`, `motion`

Put them in a `Theme` context. Switch with `useColorScheme()`. Do not keep a separate hardcoded palette in screens.

## Navigation

- Native stack + bottom tabs: **Today** | **Catalog**
- Large titles on Today and Catalog
- Tab bar: `canvas` background, `line` hairline, active tint `accent`, inactive `inkMuted`
- No custom floating glass tab bar

## Screens

**Today.** Canvas background. One metric row (readiness + streak) in a surface card. Suggestions as a grouped list, not three marketing tiles. Reason chips: `up_next` = accent, `review` = clay, `fill` = muted.

**Catalog.** Native section list. Topic header: title + readiness % in mono/tabular. Rows: LC number in mono, title in sans, difficulty pill, confidence pill.

**Problem.** Grouped inset list. Confidence control is a segmented control or tappable pill, not a web badge clone. Notes in a plain text area on `surfaceRaised`.

## Type on iOS

Prefer loading Plus Jakarta Sans + IBM Plex Mono. If not loaded:

- UI: `System` (SF Pro)
- Numbers: SF Pro with `fontVariant: ['tabular-nums']` or Menlo for LC ids

Minimum body 16px on phone. Title 1 / Title 2 for screen titles. Hit targets 44pt.

## Color usage on mobile

| Element | Token |
| --- | --- |
| Screen background | `canvas` |
| Grouped list | `surface` |
| Separators | `line` |
| Primary label | `ink` |
| Secondary label | `inkMuted` |
| Tint / links / active | `accent` |
| Log attempt | `trackCoding` |
| Open LeetCode | secondary / `line` border |
| Easy / Medium / Hard | `easy` / `medium` / `hard` |
| Confidence | `statusIdle` → `statusReady` |

Status and difficulty still need text labels. Color only is not enough.

## Shadows

Light: very soft tinted shadow on the Today metric card only.
Dark: no shadows; hairline `line` borders.

## Motion

220ms default. No loop animations. Respect Reduce Motion.

## Out of scope for this theme

Do not port the web header, Career tab, or Live pack “spoken” block. Do not restyle native switches/alerts. Do not add a second brand color beyond pine + clay + system slate.
