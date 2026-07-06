import { Platform } from 'react-native';

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

export function tabBarBottomPadding(safeAreaBottom: number) {
  return TAB_BAR_HEIGHT + safeAreaBottom + 16;
}
