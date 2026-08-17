/**
 * Theme configuration for React Navigation and shared app styling.
 */

import { Platform } from 'react-native';

import { SolderiColors } from './colors';

export const Colors = {
  light: {
    text: SolderiColors.textPrimary,
    background: SolderiColors.background,
    tint: SolderiColors.accent,
    icon: SolderiColors.textSecondary,
    tabIconDefault: SolderiColors.textMuted,
    tabIconSelected: SolderiColors.accent,
  },
  dark: {
    text: SolderiColors.textPrimary,
    background: SolderiColors.background,
    tint: SolderiColors.accent,
    icon: SolderiColors.textSecondary,
    tabIconDefault: SolderiColors.textMuted,
    tabIconSelected: SolderiColors.accent,
  },
};

export const NavigationTheme = {
  background: SolderiColors.background,
  card: SolderiColors.surface,
  border: SolderiColors.border,
  primary: SolderiColors.accent,
  text: SolderiColors.textPrimary,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
