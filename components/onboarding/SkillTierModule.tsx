import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { SolderiColors } from '@/constants/colors';
import type { ExperienceLevel } from '@/constants/onboarding';

type SkillTierModuleProps = {
  tier: ExperienceLevel;
  size?: number;
};

const SURFACE = SolderiColors.surfaceElevated;
const SURFACE_DARK = SolderiColors.surface;
const EDGE = SolderiColors.border;
const ACCENT = SolderiColors.accent;
const MUTED = SolderiColors.textMuted;

export function SkillTierModule({ tier, size = 100 }: SkillTierModuleProps) {
  if (tier === 'beginner') {
    return <BeginnerModule size={size} />;
  }
  if (tier === 'intermediate') {
    return <IntermediateModule size={size} />;
  }
  return <AdvancedModule size={size} />;
}

function BeginnerModule({ size }: { size: number }) {
  const h = size * 0.95;
  return (
    <Svg width={size} height={h} viewBox="0 0 100 95">
      <Defs>
        <LinearGradient id="begTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#34393C" />
          <Stop offset="1" stopColor={SURFACE} />
        </LinearGradient>
        <LinearGradient id="begLeft" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={SURFACE} />
          <Stop offset="1" stopColor={SURFACE_DARK} />
        </LinearGradient>
      </Defs>

      <Path d="M 50 58 L 78 72 L 50 86 L 22 72 Z" fill="url(#begLeft)" />
      <Path d="M 50 44 L 78 58 L 50 72 L 22 58 Z" fill="url(#begTop)" stroke={EDGE} strokeWidth={0.8} />
      <Path d="M 50 72 L 78 58 L 78 72 L 50 86 Z" fill={SURFACE_DARK} opacity={0.92} />

      <Circle cx={50} cy={38} r={9} fill={SURFACE_DARK} stroke={EDGE} strokeWidth={1} />
      <Circle cx={50} cy={38} r={4} fill={MUTED} opacity={0.7} />

      <Line x1={50} y1={44} x2={50} y2={48} stroke={EDGE} strokeWidth={1.2} opacity={0.5} />
    </Svg>
  );
}

function IntermediateModule({ size }: { size: number }) {
  const h = size * 1.05;
  return (
    <Svg width={size} height={h} viewBox="0 0 110 105">
      <Defs>
        <LinearGradient id="intTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3A4044" />
          <Stop offset="1" stopColor={SURFACE} />
        </LinearGradient>
      </Defs>

      <Path d="M 55 68 L 88 84 L 55 100 L 22 84 Z" fill={SURFACE_DARK} />
      <Path d="M 55 52 L 88 68 L 55 84 L 22 68 Z" fill="url(#intTop)" stroke={EDGE} strokeWidth={0.8} />
      <Path d="M 55 84 L 88 68 L 88 84 L 55 100 Z" fill="#1E2226" opacity={0.95} />

      <Path d="M 55 34 L 76 46 L 55 58 L 34 46 Z" fill={SURFACE} stroke={EDGE} strokeWidth={0.7} />
      <Path d="M 55 58 L 76 46 L 76 58 L 55 70 Z" fill={SURFACE_DARK} opacity={0.9} />
      <Path d="M 34 46 L 34 58 L 55 70 L 55 58 Z" fill="#25292C" />

      <Rect x={48} y={38} width={14} height={8} rx={2} fill={SURFACE_DARK} stroke={EDGE} strokeWidth={0.6} />
      <Circle cx={42} cy={42} r={3} fill={MUTED} opacity={0.65} />
      <Circle cx={68} cy={42} r={3} fill={ACCENT} opacity={0.55} />

      <Line x1={76} y1={52} x2={92} y2={44} stroke={EDGE} strokeWidth={1.2} opacity={0.45} />
      <Circle cx={92} cy={44} r={2.5} fill={MUTED} opacity={0.5} />
    </Svg>
  );
}

function AdvancedModule({ size }: { size: number }) {
  const h = size * 1.12;
  return (
    <Svg width={size} height={h} viewBox="0 0 120 115">
      <Defs>
        <LinearGradient id="advTop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#42484C" />
          <Stop offset="1" stopColor={SURFACE} />
        </LinearGradient>
      </Defs>

      <Path d="M 60 76 L 98 94 L 60 112 L 22 94 Z" fill="#1A1D20" />
      <Path d="M 60 58 L 98 76 L 60 94 L 22 76 Z" fill="url(#advTop)" stroke={EDGE} strokeWidth={0.8} />
      <Path d="M 60 94 L 98 76 L 98 94 L 60 112 Z" fill={SURFACE_DARK} />

      <Path d="M 60 36 L 84 50 L 60 64 L 36 50 Z" fill={SURFACE} stroke={ACCENT} strokeWidth={0.5} opacity={0.95} />
      <Path d="M 60 64 L 84 50 L 84 64 L 60 78 Z" fill="#25292C" />
      <Path d="M 36 50 L 36 64 L 60 78 L 60 64 Z" fill={SURFACE_DARK} />

      <Path d="M 18 62 L 28 56 L 28 70 L 18 76 Z" fill={SURFACE_DARK} stroke={EDGE} strokeWidth={0.5} />
      <Path d="M 102 62 L 92 56 L 92 70 L 102 76 Z" fill={SURFACE_DARK} stroke={EDGE} strokeWidth={0.5} />

      <Line x1={42} y1={44} x2={78} y2={44} stroke={EDGE} strokeWidth={0.8} opacity={0.45} />
      <Line x1={42} y1={50} x2={78} y2={50} stroke={EDGE} strokeWidth={0.8} opacity={0.35} />
      <Line x1={48} y1={40} x2={48} y2={54} stroke={EDGE} strokeWidth={0.8} opacity={0.3} />
      <Line x1={60} y1={40} x2={60} y2={54} stroke={EDGE} strokeWidth={0.8} opacity={0.3} />
      <Line x1={72} y1={40} x2={72} y2={54} stroke={EDGE} strokeWidth={0.8} opacity={0.3} />

      <Rect x={52} y={42} width={16} height={10} rx={2} fill="#1E2226" stroke={ACCENT} strokeWidth={0.6} opacity={0.85} />
      <Circle cx={38} cy={46} r={2.5} fill={ACCENT} opacity={0.7} />
      <Circle cx={82} cy={46} r={2.5} fill={MUTED} opacity={0.6} />
      <Circle cx={60} cy={28} r={4} fill={ACCENT} opacity={0.45} />
      <Line x1={60} y1={32} x2={60} y2={36} stroke={ACCENT} strokeWidth={1} opacity={0.5} />
    </Svg>
  );
}
