import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { SolderiColors } from '@/constants/colors';

type WorkbenchSurfaceProps = {
  width: number;
  height: number;
};

/** ViewBox coordinates of the bench top-face — keep in sync with `topFace` path. */
export const WORKBENCH_FACE = {
  viewboxHeight: 220,
  topY: 52,
  bottomY: 168,
} as const;

export function getBenchFaceOverlayInsets(surfaceHeight: number, stageHeight: number) {
  const { viewboxHeight, topY, bottomY } = WORKBENCH_FACE;
  const faceTop = (topY / viewboxHeight) * surfaceHeight;
  const faceBottom = (bottomY / viewboxHeight) * surfaceHeight;

  return {
    top: Math.round(faceTop),
    bottom: Math.round(stageHeight - faceBottom),
  };
}

/** Stylised top-down perspective electronics workbench surface. */
export function WorkbenchSurface({ width, height }: WorkbenchSurfaceProps) {
  const vbW = 390;
  const vbH = 220;

  const topFace = 'M 8 52 L 382 52 L 398 168 L -8 168 Z';
  const frontFace = 'M -8 168 L 398 168 L 398 186 L -8 186 Z';
  const leftSide = 'M -8 168 L 8 52 L 8 168 Z';
  const rightSide = 'M 382 52 L 398 168 L 398 186 L 382 168 Z';

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="benchTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2E3336" />
          <Stop offset="1" stopColor={SolderiColors.surface} />
        </LinearGradient>
        <LinearGradient id="benchFront" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1E2226" />
          <Stop offset="1" stopColor="#141719" />
        </LinearGradient>
        <LinearGradient id="benchSide" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#181B1E" />
          <Stop offset="1" stopColor="#25292C" />
        </LinearGradient>
      </Defs>

      <Path d={leftSide} fill="url(#benchSide)" opacity={0.9} />
      <Path d={rightSide} fill="#1A1D20" opacity={0.85} />
      <Path d={frontFace} fill="url(#benchFront)" />
      <Path d={topFace} fill="url(#benchTop)" stroke={SolderiColors.border} strokeWidth={0.8} />

      {[70, 95, 120, 145].map((y) => (
        <Line
          key={`grid-h-${y}`}
          x1={20 + (y - 52) * 0.08}
          y1={y}
          x2={370 - (y - 52) * 0.08}
          y2={y}
          stroke={SolderiColors.border}
          strokeWidth={0.5}
          opacity={0.22}
        />
      ))}
      {[80, 160, 240, 320].map((x) => {
        const t = (x - 80) / 240;
        const y1 = 58 + t * 4;
        const y2 = 162 - t * 2;
        return (
          <Line
            key={`grid-v-${x}`}
            x1={x}
            y1={y1}
            x2={x - 8}
            y2={y2}
            stroke={SolderiColors.border}
            strokeWidth={0.5}
            opacity={0.16}
          />
        );
      })}

      {[60, 120, 180, 240, 300].map((x) => (
        <Line
          key={`mark-${x}`}
          x1={x}
          y1={158}
          x2={x}
          y2={163}
          stroke={SolderiColors.textMuted}
          strokeWidth={0.8}
          opacity={0.25}
        />
      ))}

      <WorkbenchProps />
    </Svg>
  );
}

function WorkbenchProps() {
  return (
    <G opacity={0.55}>
      <G transform="translate(28, 118)">
        <Rect x={0} y={8} width={28} height={5} rx={1.5} fill="#3A4044" />
        <Rect x={24} y={0} width={6} height={14} rx={1} fill={SolderiColors.accent} opacity={0.65} />
      </G>

      <G transform="translate(318, 122)">
        <Path d="M 0 12 L 8 0 L 10 2 L 4 14 Z" fill={SolderiColors.textMuted} />
        <Path d="M 12 12 L 20 0 L 22 2 L 16 14 Z" fill={SolderiColors.textMuted} opacity={0.7} />
      </G>

      <G transform="translate(330, 68)">
        <Circle cx={12} cy={12} r={11} fill="none" stroke={SolderiColors.border} strokeWidth={1.2} />
        <Circle cx={12} cy={12} r={5} fill={SolderiColors.surfaceElevated} />
        <Line x1={12} y1={1} x2={12} y2={6} stroke={SolderiColors.border} strokeWidth={1} />
      </G>

      <G transform="translate(168, 62)">
        <Rect x={0} y={0} width={54} height={22} rx={3} fill={SolderiColors.surfaceElevated} stroke={SolderiColors.border} strokeWidth={0.7} />
        <Line x1={6} y1={8} x2={48} y2={8} stroke={SolderiColors.border} strokeWidth={0.6} opacity={0.5} />
        <Line x1={6} y1={14} x2={48} y2={14} stroke={SolderiColors.border} strokeWidth={0.6} opacity={0.5} />
      </G>

      <G transform="translate(52, 78)">
        <Rect x={0} y={0} width={36} height={20} rx={2} fill="#25292C" stroke={SolderiColors.border} strokeWidth={0.6} />
        {[6, 12, 18, 24, 30].map((x) => (
          <Line key={x} x1={x} y1={3} x2={x} y2={17} stroke={SolderiColors.border} strokeWidth={0.4} opacity={0.45} />
        ))}
      </G>

      <Circle cx={290} cy={130} r={3} fill={SolderiColors.accent} opacity={0.45} />
      <Rect x={72} y={132} width={10} height={3} rx={1} fill={SolderiColors.textMuted} opacity={0.5} />
      <Circle cx={248} cy={118} r={2} fill={SolderiColors.success} opacity={0.4} />
      <Circle cx={110} cy={108} r={1.5} fill={SolderiColors.textMuted} opacity={0.35} />
      <Circle cx={110} cy={112} r={1.5} fill={SolderiColors.textMuted} opacity={0.35} />
    </G>
  );
}

/** Ground shadow for components sitting on the bench. */
export function BenchComponentShadow({ width = 52 }: { width?: number }) {
  return (
    <Svg width={width} height={10} viewBox={`0 0 ${width} 10`}>
      <Ellipse cx={width / 2} cy={5} rx={width / 2 - 2} ry={4} fill="#000" opacity={0.28} />
    </Svg>
  );
}
