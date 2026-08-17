export const SolderiColors = {
  background: '#0D0F14',
  surface: '#171B24',
  surfaceElevated: '#1C202A',
  accent: '#20B8C4',
  accentDark: '#1A9AA4',
  accentMuted: 'rgba(32, 184, 196, 0.12)',
  accentSoft: 'rgba(32, 184, 196, 0.08)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#F5F5F7',
  textSecondary: '#969BA7',
  textMuted: '#666B76',
  success: '#34D399',
  warning: '#FBBF24',
} as const;

/** @deprecated Use SolderiColors — kept for backward compatibility across the app */
export const ArduinoColors = {
  blue: SolderiColors.accent,
  blueDark: SolderiColors.accentDark,
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
