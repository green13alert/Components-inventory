import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useSolderiColors } from '@/context/theme-context';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 236;
const PATH_A = 'M38 92 H100 V28';
const PATH_B = 'M100 110 H174 V178';

type AiNetworkVisualProps = {
  size?: number;
};

export function AiNetworkVisual({ size = SIZE }: AiNetworkVisualProps) {
  const colors = useSolderiColors();
  const travelA = useSharedValue(220);
  const travelB = useSharedValue(260);
  const pulse = useSharedValue(0.28);

  useEffect(() => {
    travelA.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 5200, easing: Easing.inOut(Easing.quad) }),
        withTiming(220, { duration: 0 }),
      ),
      -1,
      false,
    );
    travelB.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 6400, easing: Easing.inOut(Easing.quad) }),
          withTiming(260, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    pulse.value = withRepeat(withTiming(0.55, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse, travelA, travelB]);

  const pulseAProps = useAnimatedProps(() => ({
    strokeDashoffset: travelA.value,
  }));
  const pulseBProps = useAnimatedProps(() => ({
    strokeDashoffset: travelB.value,
  }));
  const coreProps = useAnimatedProps(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 200 220">
        <Path
          d="M100 28 V110"
          stroke={colors.border}
          strokeWidth={1.15}
          fill="none"
          strokeLinecap="round"
          opacity={0.55}
        />
        <Path
          d="M38 92 H100"
          stroke={colors.border}
          strokeWidth={1.15}
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
        />
        <Path
          d="M100 110 H174 V64"
          stroke={colors.border}
          strokeWidth={1.15}
          fill="none"
          strokeLinecap="round"
          opacity={0.48}
        />
        <Path
          d="M100 110 H174 V178"
          stroke={colors.border}
          strokeWidth={1.15}
          fill="none"
          strokeLinecap="round"
          opacity={0.42}
        />
        <Path
          d="M100 110 V186 H52"
          stroke={colors.border}
          strokeWidth={1.15}
          fill="none"
          strokeLinecap="round"
          opacity={0.4}
        />
        <Path
          d="M38 92 V150 H100"
          stroke={colors.border}
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
          opacity={0.32}
        />

        <AnimatedPath
          d={PATH_A}
          stroke={colors.accent}
          strokeWidth={1.35}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="18 220"
          animatedProps={pulseAProps}
          opacity={0.7}
        />
        <AnimatedPath
          d={PATH_B}
          stroke={colors.accent}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="14 260"
          animatedProps={pulseBProps}
          opacity={0.45}
        />

        <AnimatedCircle
          cx={100}
          cy={110}
          r={11}
          stroke={colors.accent}
          strokeWidth={1}
          fill="none"
          animatedProps={coreProps}
        />
        <Circle cx={100} cy={110} r={2.6} fill={colors.accent} opacity={0.85} />

        <Circle cx={100} cy={28} r={2.1} fill={colors.textMuted} opacity={0.55} />
        <Circle cx={38} cy={92} r={2.1} fill={colors.textMuted} opacity={0.5} />
        <Circle cx={174} cy={64} r={2.1} fill={colors.textMuted} opacity={0.5} />
        <Circle cx={174} cy={178} r={2.1} fill={colors.accent} opacity={0.35} />
        <Circle cx={52} cy={186} r={2.1} fill={colors.textMuted} opacity={0.45} />
        <Circle cx={38} cy={150} r={1.8} fill={colors.textMuted} opacity={0.4} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
