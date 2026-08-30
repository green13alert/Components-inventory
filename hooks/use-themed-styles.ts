import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { useSolderiColors } from '@/context/theme-context';
import type { SolderiPalette } from '@/constants/colors';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (colors: SolderiPalette) => T,
): T {
  const colors = useSolderiColors();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
