import { Platform } from 'react-native';

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;
export const TAB_BAR_FLOATING_HEIGHT = 58;
export const TAB_BAR_BOTTOM_MARGIN = 12;

export function tabBarBottomPadding(safeAreaBottom: number) {
  return TAB_BAR_FLOATING_HEIGHT + TAB_BAR_BOTTOM_MARGIN + Math.max(safeAreaBottom, 12) + 8;
}
