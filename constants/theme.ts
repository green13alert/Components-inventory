/**
 * Theme configuration for React Navigation and shared app styling.
 */

import { DarkTheme, DefaultTheme, type Theme } from 'expo-router/react-navigation';
import { Platform } from 'react-native';

import { SolderiDarkColors, SolderiLightColors, type SolderiPalette } from './colors';

export function getNavigationTheme(colors: SolderiPalette, scheme: 'light' | 'dark'): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.accent,
      text: colors.textPrimary,
    },
  };
}

export const Colors = {
  light: {
    text: SolderiLightColors.textPrimary,
    background: SolderiLightColors.background,
    tint: SolderiLightColors.accent,
    icon: SolderiLightColors.textSecondary,
    tabIconDefault: SolderiLightColors.textMuted,
    tabIconSelected: SolderiLightColors.accent,
  },
  dark: {
    text: SolderiDarkColors.textPrimary,
    background: SolderiDarkColors.background,
    tint: SolderiDarkColors.accent,
    icon: SolderiDarkColors.textSecondary,
    tabIconDefault: SolderiDarkColors.textMuted,
    tabIconSelected: SolderiDarkColors.accent,
  },
};

export const NavigationTheme = {
  background: SolderiDarkColors.background,
  card: SolderiDarkColors.surface,
  border: SolderiDarkColors.border,
  primary: SolderiDarkColors.accent,
  text: SolderiDarkColors.textPrimary,
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
