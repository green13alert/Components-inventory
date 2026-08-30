import { useSolderiTheme } from '@/context/theme-context';
import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { resolvedScheme } = useSolderiTheme();
  const colorFromProps = props[resolvedScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[resolvedScheme][colorName];
}
