/**
 * Solderi design tokens — single source of truth for colour.
 * Import `SolderiColors` in new code. `ArduinoColors` is a legacy alias.
 */

const palette = {
  background: '#181B1E',
  surface: '#212528',
  surfaceElevated: '#2A2E31',
  border: '#363B3E',
  textPrimary: '#F4F4F1',
  textSecondary: '#A7ACAD',
  textMuted: '#7A8082',
  amber: '#FFB547',
  amberStrong: '#FF9F1C',
  amberSurface: '#2F2818',
  success: '#4ADE80',
  error: '#F87171',
  onAccent: '#181B1E',
  scrim: '#181B1E',
} as const;

export const SolderiColors = {
  // Surfaces
  background: palette.background,
  surface: palette.surface,
  surfaceElevated: palette.surfaceElevated,

  // Accent — use sparingly for CTAs, active states, progress, key highlights
  accent: palette.amber,
  accentStrong: palette.amberStrong,
  accentSoft: palette.amberSurface,
  accentMuted: 'rgba(255, 181, 71, 0.14)',
  accentBorder: 'rgba(255, 181, 71, 0.32)',

  // Borders
  border: palette.border,
  borderSubtle: '#2A2E31',

  // Text
  textPrimary: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,
  onAccent: palette.onAccent,

  // Semantic
  success: palette.success,
  successMuted: 'rgba(74, 222, 128, 0.14)',
  warning: palette.amberStrong,
  error: palette.error,
  errorMuted: 'rgba(248, 113, 113, 0.12)',

  // Overlays & chrome
  overlay: `${palette.scrim}BF`,
  overlayLight: `${palette.scrim}8C`,
  barSurface: `${palette.surface}E0`,
} as const;

/** @deprecated Use SolderiColors — kept for backward compatibility across the app */
export const ArduinoColors = {
  blue: SolderiColors.accent,
  blueDark: SolderiColors.accentStrong,
  blueMuted: SolderiColors.accentMuted,
  blueSoft: SolderiColors.accentSoft,
  background: SolderiColors.background,
  surface: SolderiColors.surface,
  surfaceElevated: SolderiColors.surfaceElevated,
  border: SolderiColors.border,
  textPrimary: SolderiColors.textPrimary,
  textSecondary: SolderiColors.textSecondary,
  textMuted: SolderiColors.textMuted,
  success: SolderiColors.success,
  warning: SolderiColors.warning,
};

export type SolderiColorToken = keyof typeof SolderiColors;
