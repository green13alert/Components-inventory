import type { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';

/** Native press opacity. It updates before the press handler's render commits. */
export function pressFeedback(style: StyleProp<ViewStyle>) {
  return ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
    style,
    pressed ? { opacity: 0.62 } : null,
  ];
}
