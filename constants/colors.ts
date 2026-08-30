/**
 * Solderi design tokens — Dark is the primary look and must stay unchanged.
 * Components should read colours from `useSolderiColors()`, not this module-level object.
 */

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedScheme = 'light' | 'dark';

export type SolderiPalette = {
  background: string;
  surface: string;
  surfaceElevated: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentMuted: string;
  accentBorder: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  onAccent: string;
  success: string;
  successMuted: string;
  warning: string;
  error: string;
  errorMuted: string;
  overlay: string;
  overlayLight: string;
  barSurface: string;
  graphEmpty: string;
  gradientStart: string;
  blurTint: 'light' | 'dark';
};

export const SolderiDarkColors: SolderiPalette = {
  background: '#181B1E',
  surface: '#212528',
  surfaceElevated: '#2A2E31',
  accent: '#FFB547',
  accentStrong: '#FF9F1C',
  accentSoft: '#2F2818',
  accentMuted: 'rgba(255, 181, 71, 0.14)',
  accentBorder: 'rgba(255, 181, 71, 0.32)',
  border: '#363B3E',
  borderSubtle: '#2A2E31',
  textPrimary: '#F4F4F1',
  textSecondary: '#A7ACAD',
  textMuted: '#7A8082',
  onAccent: '#181B1E',
  success: '#4ADE80',
  successMuted: 'rgba(74, 222, 128, 0.14)',
  warning: '#FF9F1C',
  error: '#F87171',
  errorMuted: 'rgba(248, 113, 113, 0.12)',
  overlay: '#181B1EBF',
  overlayLight: '#181B1E8C',
  barSurface: '#212528E0',
  graphEmpty: '#2A2E31',
  gradientStart: '#1E2226',
  blurTint: 'dark',
};

/** Warm daylight palette — same structure as Dark, not an inversion. */
export const SolderiLightColors: SolderiPalette = {
  background: '#F3F0EA',
  surface: '#FCFAF6',
  surfaceElevated: '#FFFFFF',
  accent: '#FFB547',
  accentStrong: '#E8890C',
  accentSoft: '#F6E6C8',
  accentMuted: 'rgba(232, 137, 12, 0.14)',
  accentBorder: 'rgba(232, 137, 12, 0.34)',
  border: '#E0DBD2',
  borderSubtle: '#EBE6DE',
  textPrimary: '#1C1E20',
  textSecondary: '#5C6164',
  textMuted: '#8A8F92',
  onAccent: '#1C1E20',
  success: '#2F9E57',
  successMuted: 'rgba(47, 158, 87, 0.14)',
  warning: '#E8890C',
  error: '#D4524F',
  errorMuted: 'rgba(212, 82, 79, 0.12)',
  overlay: '#1C1E20A8',
  overlayLight: '#1C1E207A',
  barSurface: '#FCFAF6E8',
  graphEmpty: '#E6E1D8',
  gradientStart: '#F7F4EE',
  blurTint: 'light',
};

export const SolderiPalettes = {
  dark: SolderiDarkColors,
  light: SolderiLightColors,
} as const;

/**
 * Module-level Dark tokens. Prefer `useSolderiColors()` in UI so Light Mode works.
 * Kept so Dark remains the literal source of the original Solderi look.
 */
export const SolderiColors = SolderiDarkColors;

/** @deprecated Use SolderiColors / useSolderiColors — kept for backward compatibility */
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

export type SolderiColorToken = keyof SolderiPalette;
