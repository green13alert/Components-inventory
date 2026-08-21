import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { SolderiColors } from '@/constants/colors';

const AnimatedG = Animated.createAnimatedComponent(G);

const VIEW_W = 390;
const VIEW_H = 844;
const TRANSITION_MS = 720;

const TRACE = SolderiColors.textMuted;
const TRACE_SOFT = SolderiColors.border;
const TRACE_ACCENT = SolderiColors.accent;

type TraceWeight = 'primary' | 'medium' | 'fine' | 'subtle';

const WEIGHTS: Record<TraceWeight, { strokeWidth: number; opacity: number }> = {
  primary: { strokeWidth: 2.2, opacity: 0.82 },
  medium: { strokeWidth: 1.6, opacity: 0.68 },
  fine: { strokeWidth: 1.1, opacity: 0.52 },
  subtle: { strokeWidth: 0.85, opacity: 0.38 },
};

type ExperienceCircuitBackgroundProps = {
  /** 0 = beginner, 1 = intermediate, 2 = advanced, null = idle */
  activeStage: number | null;
  width: number;
  height: number;
};

function TracePath({
  d,
  weight = 'medium',
  accent = false,
}: {
  d: string;
  weight?: TraceWeight;
  accent?: boolean;
}) {
  const w = WEIGHTS[weight];
  return (
    <Path
      d={d}
      stroke={accent ? TRACE_ACCENT : TRACE}
      strokeWidth={w.strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={accent ? w.opacity * 0.75 : w.opacity}
    />
  );
}

function TraceLine({
  x1,
  y1,
  x2,
  y2,
  weight = 'fine',
  accent = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight?: TraceWeight;
  accent?: boolean;
}) {
  const w = WEIGHTS[weight];
  return (
    <Line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={accent ? TRACE_ACCENT : TRACE_SOFT}
      strokeWidth={w.strokeWidth}
      opacity={accent ? w.opacity * 0.7 : w.opacity}
    />
  );
}

function Pad({
  cx,
  cy,
  r = 3.5,
  accent = false,
}: {
  cx: number;
  cy: number;
  r?: number;
  accent?: boolean;
}) {
  return (
    <Circle
      cx={cx}
      cy={cy}
      r={r}
      fill={accent ? TRACE_ACCENT : TRACE}
      opacity={accent ? 0.72 : 0.62}
    />
  );
}

function Chip({
  x,
  y,
  width,
  height,
  pins = 3,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  pins?: number;
}) {
  const pinSpacing = height / (pins + 1);
  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        stroke={TRACE}
        strokeWidth={1.4}
        fill="rgba(42, 46, 49, 0.35)"
        opacity={0.75}
      />
      {Array.from({ length: pins }).map((_, i) => {
        const py = y + pinSpacing * (i + 1);
        return (
          <G key={i}>
            <Line x1={x - 10} y1={py} x2={x} y2={py} stroke={TRACE_SOFT} strokeWidth={1} opacity={0.55} />
            <Line
              x1={x + width}
              y1={py}
              x2={x + width + 10}
              y2={py}
              stroke={TRACE_SOFT}
              strokeWidth={1}
              opacity={0.55}
            />
          </G>
        );
      })}
    </G>
  );
}

function BackboneLayer() {
  return (
    <G>
      <TracePath d="M 48 420 L 130 420 L 130 540" weight="medium" />
      <TracePath d="M 342 360 L 260 360 L 260 480" weight="medium" />
      <TracePath d="M 195 120 L 195 200" weight="medium" />
      <TracePath d="M 195 600 L 195 680" weight="medium" />

      <Pad cx={130} cy={420} />
      <Pad cx={260} cy={360} accent />
      <Pad cx={195} cy={420} />
    </G>
  );
}

function BeginnerLayer() {
  return (
    <G>
      <TracePath d="M 48 130 L 170 130 L 170 230" weight="primary" />
      <TracePath d="M 220 680 L 220 760 L 342 760" weight="primary" />
      <TracePath d="M 280 110 L 330 110 L 330 210" weight="medium" />
      <TracePath d="M 48 560 L 48 640 L 148 640" weight="medium" />
      <TracePath d="M 60 480 L 330 480" weight="medium" accent />
      <TracePath d="M 300 300 L 330 300 L 330 380" weight="medium" />
      <TracePath d="M 48 300 L 120 300 L 120 380" weight="medium" />

      <TraceLine x1={170} y1={130} x2={220} y2={130} weight="fine" />
      <TraceLine x1={148} y1={640} x2={220} y2={640} weight="fine" />
      <TraceLine x1={300} y1={480} x2={300} y2={560} weight="fine" />

      <Pad cx={170} cy={130} accent />
      <Pad cx={170} cy={230} />
      <Pad cx={342} cy={760} />
      <Pad cx={330} cy={210} />
      <Pad cx={148} cy={640} />
      <Pad cx={300} cy={480} accent />
    </G>
  );
}

function IntermediateLayer() {
  return (
    <G>
      <TracePath d="M 60 200 L 180 200 L 180 290 L 90 290 L 90 360" weight="medium" />
      <TracePath d="M 210 240 L 330 240 L 330 320 L 240 320 L 240 390" weight="medium" />
      <TracePath d="M 50 600 L 150 600 L 150 680 L 80 680 L 80 740" weight="medium" />
      <TracePath d="M 240 560 L 340 560 L 340 640 L 260 640" weight="medium" />
      <TracePath d="M 130 72 L 130 160 L 210 160" weight="fine" accent />
      <TracePath d="M 300 680 L 330 680 L 330 620" weight="fine" />

      <TraceLine x1={90} y1={360} x2={90} y2={420} weight="fine" />
      <TraceLine x1={240} y1={390} x2={240} y2={480} weight="fine" />
      <TraceLine x1={340} y1={560} x2={330} y2={560} weight="fine" />
      <TraceLine x1={150} y1={600} x2={150} y2={540} weight="subtle" />
      <TraceLine x1={260} y1={640} x2={260} y2={700} weight="fine" />

      <Chip x={300} y={130} width={52} height={36} pins={3} />
      <Chip x={44} y={430} width={44} height={32} pins={2} />

      <Pad cx={180} cy={200} accent />
      <Pad cx={330} cy={240} />
      <Pad cx={150} cy={600} />
      <Pad cx={340} cy={560} accent />
      <Pad cx={90} cy={290} />
      <Pad cx={240} cy={320} />
    </G>
  );
}

function AdvancedLayer() {
  const gridY = [250, 320, 390, 460, 530, 600, 670];
  const gridX = [60, 130, 200, 270, 340];

  return (
    <G>
      {gridY.map((y) => (
        <TraceLine key={`h-${y}`} x1={52} y1={y} x2={338} y2={y} weight="fine" />
      ))}
      {gridX.map((x) => (
        <TraceLine key={`v-${x}`} x1={x} y1={220} x2={x} y2={720} weight="fine" />
      ))}

      <TracePath
        d="M 60 250 L 130 250 L 130 320 L 200 320 L 200 390 L 270 390 L 270 460 L 340 460"
        weight="medium"
        accent
      />
      <TracePath d="M 340 320 L 340 250 L 270 250 L 270 180 L 200 180" weight="medium" />
      <TracePath d="M 60 530 L 130 530 L 130 600 L 200 600 L 200 670 L 270 670" weight="medium" />
      <TracePath d="M 340 600 L 340 670 L 270 600 L 200 530 L 130 460" weight="fine" accent />

      <Chip x={158} y={350} width={58} height={42} pins={4} />
      <Chip x={228} y={500} width={48} height={36} pins={3} />
      <Chip x={68} y={620} width={40} height={30} pins={2} />
      <Chip x={288} y={280} width={44} height={32} pins={2} />

      <Rect
        x={52}
        y={748}
        width={36}
        height={18}
        rx={2}
        stroke={TRACE_SOFT}
        strokeWidth={1.2}
        fill="none"
        opacity={0.55}
      />
      <Rect
        x={302}
        y={748}
        width={44}
        height={18}
        rx={2}
        stroke={TRACE_SOFT}
        strokeWidth={1.2}
        fill="none"
        opacity={0.55}
      />

      {gridX.flatMap((x) =>
        gridY.map((y) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={2} fill={TRACE_SOFT} opacity={0.45} />
        )),
      )}

      <Pad cx={130} cy={250} accent />
      <Pad cx={200} cy={390} accent />
      <Pad cx={270} cy={460} />
      <Pad cx={340} cy={320} />
      <Pad cx={60} cy={530} />
      <Pad cx={200} cy={670} accent />
    </G>
  );
}

export function ExperienceCircuitBackground({
  activeStage,
  width,
  height,
}: ExperienceCircuitBackgroundProps) {

  const backboneOpacity = useSharedValue(0.9);
  const beginnerOpacity = useSharedValue(0.88);
  const intermediateOpacity = useSharedValue(0.95);
  const advancedOpacity = useSharedValue(1);

  useEffect(() => {
    if (activeStage === 0) {
      backboneOpacity.value = withTiming(0.72, { duration: TRANSITION_MS });
      beginnerOpacity.value = withTiming(1, { duration: TRANSITION_MS });
      intermediateOpacity.value = withTiming(0, { duration: TRANSITION_MS });
      advancedOpacity.value = withTiming(0, { duration: TRANSITION_MS });
      return;
    }

    if (activeStage === 1) {
      backboneOpacity.value = withTiming(0.82, { duration: TRANSITION_MS });
      beginnerOpacity.value = withTiming(0.92, { duration: TRANSITION_MS });
      intermediateOpacity.value = withTiming(1, { duration: TRANSITION_MS });
      advancedOpacity.value = withTiming(0, { duration: TRANSITION_MS });
      return;
    }

    // Default (no selection) and Advanced — full complexity
    backboneOpacity.value = withTiming(0.9, { duration: TRANSITION_MS });
    beginnerOpacity.value = withTiming(0.88, { duration: TRANSITION_MS });
    intermediateOpacity.value = withTiming(0.95, { duration: TRANSITION_MS });
    advancedOpacity.value = withTiming(1, { duration: TRANSITION_MS });
  }, [activeStage, advancedOpacity, backboneOpacity, beginnerOpacity, intermediateOpacity]);

  const backboneProps = useAnimatedProps(() => ({ opacity: backboneOpacity.value }));
  const beginnerProps = useAnimatedProps(() => ({ opacity: beginnerOpacity.value }));
  const intermediateProps = useAnimatedProps(() => ({ opacity: intermediateOpacity.value }));
  const advancedProps = useAnimatedProps(() => ({ opacity: advancedOpacity.value }));

  return (
    <View style={[styles.panel, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMax slice"
        pointerEvents="none">
        <AnimatedG animatedProps={backboneProps}>
          <BackboneLayer />
        </AnimatedG>
        <AnimatedG animatedProps={beginnerProps}>
          <BeginnerLayer />
        </AnimatedG>
        <AnimatedG animatedProps={intermediateProps}>
          <IntermediateLayer />
        </AnimatedG>
        <AnimatedG animatedProps={advancedProps}>
          <AdvancedLayer />
        </AnimatedG>
      </Svg>

      <LinearGradient
        colors={['#181B1E', '#181B1E00']}
        locations={[0, 1]}
        style={styles.topFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    overflow: 'hidden',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
});
