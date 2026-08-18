import { useEffect } from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RAIL_X = 22;
const NODE_R = 7;
const PAD_R = 2.5;

export const EXPERIENCE_STAGE_HEIGHT = 112;
export const EXPERIENCE_STAGE_GAP = 20;

export function getExperienceStageCenterY(index: number) {
  return index * (EXPERIENCE_STAGE_HEIGHT + EXPERIENCE_STAGE_GAP) + EXPERIENCE_STAGE_HEIGHT / 2;
}

export function getExperienceProgressionHeight(stageCount: number) {
  return (
    stageCount * EXPERIENCE_STAGE_HEIGHT + (stageCount - 1) * EXPERIENCE_STAGE_GAP
  );
}

type ExperienceProgressionRailProps = {
  height: number;
  stageCenters: number[];
  /** 0 = beginner, 1 = intermediate, 2 = advanced, null = none */
  activeStage: number | null;
};

export function ExperienceProgressionRail({
  height,
  stageCenters,
  activeStage,
}: ExperienceProgressionRailProps) {
  const [y0, y1, y2] = stageCenters;

  const segment0 = useSharedValue(0);
  const segment1 = useSharedValue(0);
  const node0 = useSharedValue(0.35);
  const node1 = useSharedValue(0.35);
  const node2 = useSharedValue(0.35);

  useEffect(() => {
    const active = activeStage ?? -1;

    segment0.value = withTiming(active >= 1 ? 1 : active === 0 ? 0.55 : 0.25, { duration: 320 });
    segment1.value = withTiming(active >= 2 ? 1 : active === 1 ? 0.55 : 0.25, { duration: 320 });

    node0.value = withSpring(active === 0 ? 1 : active !== null && active > 0 ? 0.45 : 0.35, {
      damping: 20,
      stiffness: 240,
    });
    node1.value = withSpring(active === 1 ? 1 : active !== null && active !== 1 ? 0.45 : 0.35, {
      damping: 20,
      stiffness: 240,
    });
    node2.value = withSpring(active === 2 ? 1 : active !== null && active < 2 ? 0.45 : 0.35, {
      damping: 20,
      stiffness: 240,
    });
  }, [activeStage, node0, node1, node2, segment0, segment1]);

  const seg0Props = useAnimatedProps(() => ({
    opacity: segment0.value,
  }));
  const seg1Props = useAnimatedProps(() => ({
    opacity: segment1.value,
  }));

  const node0Props = useAnimatedProps(() => ({
    opacity: node0.value,
    r: NODE_R + node0.value * 2.5,
  }));
  const node1Props = useAnimatedProps(() => ({
    opacity: node1.value,
    r: NODE_R + node1.value * 2.5,
  }));
  const node2Props = useAnimatedProps(() => ({
    opacity: node2.value,
    r: NODE_R + node2.value * 2.5,
  }));

  const trunkPath = [
    `M ${RAIL_X} 8`,
    `L ${RAIL_X} ${y0 - 18}`,
    `Q ${RAIL_X} ${y0 - 6} ${RAIL_X + 14} ${y0}`,
    `L ${RAIL_X + 28} ${y0}`,
    `L ${RAIL_X + 10} ${y0}`,
    `Q ${RAIL_X} ${y0 + 8} ${RAIL_X} ${y0 + 22}`,
    `L ${RAIL_X} ${y1 - 18}`,
    `Q ${RAIL_X} ${y1 - 6} ${RAIL_X + 18} ${y1}`,
    `L ${RAIL_X + 34} ${y1}`,
    `L ${RAIL_X + 12} ${y1}`,
    `Q ${RAIL_X} ${y1 + 8} ${RAIL_X} ${y1 + 24}`,
    `L ${RAIL_X} ${y2 - 20}`,
    `Q ${RAIL_X} ${y2 - 4} ${RAIL_X + 22} ${y2}`,
    `L ${RAIL_X + 42} ${y2}`,
    `L ${RAIL_X + 14} ${y2}`,
    `Q ${RAIL_X} ${y2 + 10} ${RAIL_X} ${height - 8}`,
  ].join(' ');

  const seg0Path = [
    `M ${RAIL_X} ${y0 + 22}`,
    `L ${RAIL_X} ${y1 - 18}`,
    `Q ${RAIL_X} ${y1 - 6} ${RAIL_X + 18} ${y1}`,
  ].join(' ');

  const seg1Path = [
    `M ${RAIL_X} ${y1 + 24}`,
    `L ${RAIL_X} ${y2 - 20}`,
    `Q ${RAIL_X} ${y2 - 4} ${RAIL_X + 22} ${y2}`,
  ].join(' ');

  return (
    <Svg width={72} height={height} viewBox={`0 0 72 ${height}`}>
      <Path
        d={trunkPath}
        stroke={SolderiColors.border}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />

      <AnimatedPath
        d={seg0Path}
        stroke={SolderiColors.accent}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        animatedProps={seg0Props}
      />
      <AnimatedPath
        d={seg1Path}
        stroke={SolderiColors.accent}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        animatedProps={seg1Props}
      />

      <Line
        x1={RAIL_X + 28}
        y1={y0}
        x2={RAIL_X + 28}
        y2={y0 + 10}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.4}
      />
      <Line
        x1={RAIL_X + 34}
        y1={y1}
        x2={RAIL_X + 34}
        y2={y1 + 14}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.45}
      />
      <Line
        x1={RAIL_X + 34}
        y1={y1 + 14}
        x2={RAIL_X + 46}
        y2={y1 + 14}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.45}
      />
      <Line
        x1={RAIL_X + 42}
        y1={y2}
        x2={RAIL_X + 42}
        y2={y2 + 12}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={RAIL_X + 42}
        y1={y2 + 12}
        x2={RAIL_X + 56}
        y2={y2 + 12}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.5}
      />
      <Line
        x1={RAIL_X + 56}
        y1={y2 + 12}
        x2={RAIL_X + 56}
        y2={y2 + 22}
        stroke={SolderiColors.border}
        strokeWidth={1}
        opacity={0.5}
      />

      <Circle cx={RAIL_X + 46} cy={y1 + 14} r={PAD_R} fill={SolderiColors.border} opacity={0.35} />
      <Circle cx={RAIL_X + 56} cy={y2 + 12} r={PAD_R} fill={SolderiColors.border} opacity={0.4} />
      <Circle cx={RAIL_X + 56} cy={y2 + 22} r={PAD_R} fill={SolderiColors.border} opacity={0.4} />
      <Circle cx={RAIL_X + 14} cy={y2 - 8} r={PAD_R} fill={SolderiColors.border} opacity={0.3} />

      <AnimatedCircle
        cx={RAIL_X + 10}
        cy={y0}
        fill={SolderiColors.accent}
        animatedProps={node0Props}
      />
      <AnimatedCircle
        cx={RAIL_X + 12}
        cy={y1}
        fill={SolderiColors.accent}
        animatedProps={node1Props}
      />
      <AnimatedCircle
        cx={RAIL_X + 14}
        cy={y2}
        fill={SolderiColors.accent}
        animatedProps={node2Props}
      />
    </Svg>
  );
}
