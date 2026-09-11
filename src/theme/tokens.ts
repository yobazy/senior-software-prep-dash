/**
 * Interview Prep / Reps visual tokens.
 * Keep hex values in sync with `src/index.css` (`:root` / `.dark`) and
 * `design-system/MASTER.md`.
 */

export const light = {
  canvas: '#F3F1EA',
  surface: '#FBFAF6',
  surfaceRaised: '#FFFFFF',
  ink: '#17211F',
  inkMuted: '#5A6864',
  line: '#DDD8CC',
  accent: '#1B6B5C',
  accentHover: '#15574B',
  accentSoft: '#DCE8E4',
  accentOn: '#F7F4EC',
  trackStory: '#1B6B5C',
  trackCoding: '#B85C32',
  trackSystem: '#3D4A6B',
  statusIdle: '#5A6864',
  statusWork: '#B45309',
  statusAlmost: '#1D4E89',
  statusReady: '#2F7A57',
  easy: '#2F7A57',
  medium: '#B45309',
  hard: '#B42318',
  danger: '#B42318',
  focus: '#1B6B5C',
} as const

export const dark = {
  canvas: '#121614',
  surface: '#1A1F1D',
  surfaceRaised: '#222926',
  ink: '#E7EDE9',
  inkMuted: '#9AABA5',
  line: '#2C3532',
  accent: '#4AAD9C',
  accentHover: '#6BC2B3',
  accentSoft: '#1E3330',
  accentOn: '#10201C',
  trackStory: '#4AAD9C',
  trackCoding: '#E08A5A',
  trackSystem: '#8B9BC4',
  statusIdle: '#9AABA5',
  statusWork: '#E0A04A',
  statusAlmost: '#7EB0E0',
  statusReady: '#5BB98A',
  easy: '#5BB98A',
  medium: '#E0A04A',
  hard: '#E07070',
  danger: '#E07070',
  focus: '#4AAD9C',
} as const

/** Pine scale — used by existing `teal-*` utilities. */
export const pine = {
  50: '#EEF3F1',
  100: '#DDE7E3',
  200: '#C5D4CF',
  300: '#9BB5AE',
  400: '#6D9188',
  500: '#3F7468',
  600: '#1B6B5C',
  700: '#175A4E',
  800: '#16463D',
  900: '#13352F',
  950: '#121C1A',
} as const

/** Terracotta scale — used by existing `orange-*` utilities (coding track). */
export const clay = {
  50: '#FBF3ED',
  100: '#F5E4D6',
  200: '#E8C8AD',
  300: '#D9A47A',
  400: '#C97B4A',
  500: '#B85C32',
  600: '#9A4A28',
  700: '#7C3C22',
  800: '#5C2E1C',
  900: '#3F2116',
  950: '#27140D',
} as const

/** Pine-tinted neutrals — used by existing `zinc-*` dark chrome. */
export const ink = {
  50: '#F6F5F2',
  100: '#EBEAE5',
  200: '#D5D3CB',
  300: '#B5B2A8',
  400: '#8C8A82',
  500: '#6B6A64',
  600: '#52514C',
  700: '#3D3E3B',
  800: '#2A2D2B',
  900: '#1C211F',
  950: '#121614',
} as const

export const type = {
  sans: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  mono: "'IBM Plex Mono', ui-monospace, Menlo, monospace",
  /** iOS / React Native fallbacks when custom fonts are not loaded. */
  iosSans: 'System',
  iosMono: 'Menlo',
} as const

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const

export const motion = {
  fast: 160,
  base: 220,
  slow: 320,
  easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const
