# Interview Prep / Reps — design system

Source of truth for color, type, and surfaces. The web dashboard implements these tokens in `src/theme/tokens.ts` and `src/index.css`. Pass this file (plus `design-system/pages/reps.md`) to the Reps mobile app.

**Reading this as:** a personal interview-prep tool, calm and professional, pine ink on warm paper, one accent, data-first density.

Do not invent a second palette for Reps. Translate these tokens to React Native / iOS.

## Brand

| | |
| --- | --- |
| Product | Interview Prep (web) · Reps (mobile) |
| Voice | Direct, specific, unhurried |
| Accent | Pine (`#1B6B5C` light / `#4AAD9C` dark) |
| Coding track | Clay / terracotta — not default orange |
| Neutrals | Pine-tinted stone. Never mix cool zinc with mint teal |

## Type

| Role | Web | iOS (if custom fonts not loaded) |
| --- | --- | --- |
| UI / headings | Plus Jakarta Sans 400–700 | San Francisco (System) |
| Data, LC numbers, timestamps | IBM Plex Mono 400–600 | Menlo / SF Mono |
| Feature settings | `ss01`, `cv11`, `tabular-nums` on metrics | `tabular-nums` / `monospacedDigit` |

Headings: tracking −0.03em, sentence case, `text-wrap: balance`.
Section labels: 11px, semibold, uppercase, letter-spacing 0.14em, muted ink.
Body: 14–15px, line-height ~1.5, max ~65ch for prose.
Metrics (readiness %, streak): large, tight tracking, tabular figures.

Do not use Inter, Roboto, Poppins, or handwritten fonts.

## Color tokens

Use the semantic names. Do not paint every text/border with the accent.

### Light

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` | `#F3F1EA` | App background |
| `surface` | `#FBFAF6` | Cards, header |
| `surfaceRaised` | `#FFFFFF` | Inputs, nested panels |
| `ink` | `#17211F` | Primary text |
| `inkMuted` | `#5A6864` | Secondary text, labels |
| `line` | `#DDD8CC` | Hairlines, dividers |
| `accent` | `#1B6B5C` | Primary actions, active nav, links |
| `accentHover` | `#15574B` | Hover/pressed accent |
| `accentSoft` | `#DCE8E4` | Tinted fills, chip rest |
| `accentOn` | `#F7F4EC` | Text on accent fills |
| `trackStory` | `#1B6B5C` | Story track |
| `trackCoding` | `#B85C32` | Coding track, “log attempt” |
| `trackSystem` | `#3D4A6B` | System-design track |
| `statusIdle` | `#5A6864` | Not practiced |
| `statusWork` | `#B45309` | Needs work |
| `statusAlmost` | `#1D4E89` | Almost there |
| `statusReady` | `#2F7A57` | Confident |
| `easy` / `medium` / `hard` | `#2F7A57` / `#B45309` / `#B42318` | Difficulty |
| `danger` | `#B42318` | Destructive |
| `focus` | `#1B6B5C` | Focus ring |

### Dark

| Token | Hex |
| --- | --- |
| `canvas` | `#121614` |
| `surface` | `#1A1F1D` |
| `surfaceRaised` | `#222926` |
| `ink` | `#E7EDE9` |
| `inkMuted` | `#9AABA5` |
| `line` | `#2C3532` |
| `accent` | `#4AAD9C` |
| `accentHover` | `#6BC2B3` |
| `accentSoft` | `#1E3330` |
| `accentOn` | `#10201C` |
| `trackStory` | `#4AAD9C` |
| `trackCoding` | `#E08A5A` |
| `trackSystem` | `#8B9BC4` |
| `statusIdle` | `#9AABA5` |
| `statusWork` | `#E0A04A` |
| `statusAlmost` | `#7EB0E0` |
| `statusReady` | `#5BB98A` |
| `easy` / `medium` / `hard` | `#5BB98A` / `#E0A04A` / `#E07070` |
| `danger` | `#E07070` |
| `focus` | `#4AAD9C` |

Follow the system appearance on mobile. Contrast for body text must stay ≥ 4.5:1. Never use pure `#000` or `#FFF` as a full-screen canvas.

## Scales (for leftover `teal-*` / `orange-*` / `zinc-*`)

Pine (`teal-*`): 50 `#EEF3F1` → 600 `#1B6B5C` → 950 `#121C1A`

Clay (`orange-*`): 50 `#FBF3ED` → 500 `#B85C32` → 950 `#27140D`

Ink (`zinc-*`): 50 `#F6F5F2` → 900 `#1C211F` → 950 `#121614`

## Space, radius, motion

| Space | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 |
| Radius | sm 8 · md 12 · lg 16 · xl 20 · pill 999 |
| Motion | 160 / 220 / 320ms · `cubic-bezier(0.25, 0.1, 0.25, 1)` |

Honor `prefers-reduced-motion` / iOS Reduce Motion: drop to ~10ms or disable.

Light cards: hairline `line` + tinted shadow `0 1px 2px rgb(23 33 31 / 0.04), 0 8px 24px rgb(23 33 31 / 0.06)`.
Dark cards: hairline only, no drop shadow.

## Components

**Nav.** Inactive: muted ink, no fill. Active: accent fill, `accentOn` text. Do not use a loud pill on every item.

**Primary button.** Accent fill, `accentOn` label, radius 8–12, min height 36 web / 44 iOS.

**Coding CTA (log attempt).** Clay / `trackCoding`, not pine. Pine is “this is the app.” Clay is “this is a rep.”

**Cards.** Surface on canvas, radius 16–20. No generic gray border + black shadow.

**Pills (confidence / difficulty).** Border + tinted fill + matching ink. Color is never the only signal — keep the label.

**Progress.** Track color per lane (story / coding / system). Track well is `accentSoft` / muted line, not a second rainbow.

**Focus.** 2px ring, offset 2px, `focus` token.

## Texture

A 3–5% grain overlay is allowed on the canvas (web). Skip grain on React Native; use the tinted canvas color instead.

## Anti-patterns

- Inter, default Tailwind teal (`#0d9488`), default orange (`#f97316`), purple AI gradients
- Painting all copy and borders in the accent
- Glassmorphism on scrolling lists
- Neon on OLED, Caveat/Quicksand, or “handwritten personal” type
- Mixing warm paper light mode with cold zinc dark mode
- Three equal marketing feature cards as the home layout
- Emoji as icons
