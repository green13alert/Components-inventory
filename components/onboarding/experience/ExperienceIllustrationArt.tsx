/**
 * Page 2 card illustrations — simple, clean skill-level icons.
 */

import { type ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { HW } from '@/constants/component-illustration-palette';
import { SolderiColors } from '@/constants/colors';
import type { ExperienceLevel } from '@/constants/onboarding';

type AccentProps = { accent?: boolean };

function CardGround({ cx = 32, cy = 58 }: { cx?: number; cy?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={22} ry={3.5} fill={HW.dropShadow} opacity={0.38} />;
}

function CardSheen({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <Rect x={x} y={y} width={w} height={h} rx={1} fill={HW.highlight} opacity={0.28} />;
}

function CardWrap({ children }: { children: ReactNode }) {
  return (
    <G>
      <CardGround />
      {children}
    </G>
  );
}

/** Beginner — minimal breadboard circuit, generous empty space. */
function BeginnerCardArt({ accent = false }: AccentProps) {
  const led = accent ? SolderiColors.accent : HW.ledRed;
  return (
    <CardWrap>
      {/* Battery — left, separate */}
      <Rect x={6} y={30} width={10} height={16} rx={1.2} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.45} />
      <Rect x={8} y={28} width={6} height={2} rx={0.4} fill={HW.metalDark} />
      <Line x1={16} y1={38} x2={22} y2={38} stroke={HW.wireRed} strokeWidth={1.1} strokeLinecap="round" />

      {/* Breadboard — centre */}
      <Rect x={22} y={32} width={36} height={18} rx={2} fill={HW.breadWhite} stroke={HW.breadHole} strokeWidth={0.55} />
      <Rect x={24} y={34} width={32} height={1.5} rx={0.4} fill={HW.railRed} opacity={0.85} />
      <Rect x={24} y={46} width={32} height={1.5} rx={0.4} fill={HW.railBlue} opacity={0.85} />
      <Line x1={24} y1={40} x2={56} y2={40} stroke={HW.breadCream} strokeWidth={0.45} />

      {/* LED + resistor — two components only */}
      <Circle cx={32} cy={42} r={2.4} fill={led} stroke="#B91C1C" strokeWidth={0.35} />
      <Line x1={32} y1={44.5} x2={32} y2={46} stroke={HW.pinGold} strokeWidth={0.7} />
      <Path
        d="M 40 42 L 43 42 L 45 40 L 48 44 L 50 42 L 53 42"
        stroke={HW.resistorBody}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />

      <Line x1={53} y1={42} x2={58} y2={42} stroke={HW.wireBlack} strokeWidth={1} strokeLinecap="round" />
    </CardWrap>
  );
}

/** Intermediate — Arduino, sensor, motor; each in its own zone, wired together. */
function IntermediateCardArt({ accent = false }: AccentProps) {
  const boardStroke = accent ? SolderiColors.accentBorder : HW.pcbBlue;
  return (
    <CardWrap>
      {/* Sensor — top left */}
      <Rect x={8} y={14} width={16} height={11} rx={1.2} fill={HW.pcbBlueDark} stroke={HW.pcbBlue} strokeWidth={0.45} />
      <Circle cx={14} cy={17.5} r={2} fill={accent ? SolderiColors.accent : HW.sensorVent} opacity={0.7} />
      <Circle cx={20} cy={17.5} r={2} fill={accent ? SolderiColors.accent : HW.sensorVent} opacity={0.7} />
      <Line x1={16} y1={25} x2={24} y2={34} stroke={HW.wireYellow} strokeWidth={1} strokeLinecap="round" />

      {/* Arduino — bottom centre */}
      <Rect x={18} y={36} width={28} height={18} rx={1.5} fill={HW.pcbBlue} stroke={boardStroke} strokeWidth={0.55} />
      <CardSheen x={20} y={38} w={12} h={3} />
      <Rect x={24} y={42} width={10} height={8} rx={0.8} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.35} />
      <Line x1={24} y1={34} x2={24} y2={36} stroke={HW.wireYellow} strokeWidth={1} />

      {/* Motor — bottom right, separate */}
      <Rect x={46} y={38} width={14} height={12} rx={2} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.45} />
      <Circle cx={60} cy={44} r={2.8} fill={HW.metalDark} stroke={HW.metal} strokeWidth={0.4} />
      <Line x1={46} y1={44} x2={42} y2={44} stroke={HW.wireGreen} strokeWidth={1} strokeLinecap="round" />
      <Line x1={42} y1={44} x2={42} y2={40} stroke={HW.wireGreen} strokeWidth={1} strokeLinecap="round" />
      <Line x1={42} y1={40} x2={32} y2={40} stroke={HW.wireGreen} strokeWidth={1} strokeLinecap="round" />
      <Line x1={32} y1={40} x2={32} y2={36} stroke={HW.wireGreen} strokeWidth={1} strokeLinecap="round" />
    </CardWrap>
  );
}

/** Advanced — compact mechatronic chassis; structured, not cluttered. */
function AdvancedCardArt({ accent = false }: AccentProps) {
  const frame = '#5A6570';
  const joint = accent ? SolderiColors.accent : '#E87722';

  return (
    <CardWrap>
      {/* Chassis frame — U profile */}
      <Path
        d="M 14 52 L 14 38 L 50 38 L 50 52 M 14 52 L 50 52"
        fill="none"
        stroke={frame}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* PCB inside frame */}
      <Rect x={20} y={42} width={18} height={8} rx={1} fill={HW.pcbGreenMid} stroke={HW.pcbGreenLight} strokeWidth={0.45} />
      <Rect x={24} y={44} width={8} height={4} rx={0.5} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.3} />

      {/* Drive motor — mounted to right leg */}
      <Rect x={46} y={42} width={10} height={10} rx={1.5} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.45} />
      <Circle cx={56} cy={47} r={2.2} fill={HW.metalDark} stroke={HW.metal} strokeWidth={0.35} />
      <Line x1={50} y1={47} x2={46} y2={47} stroke={frame} strokeWidth={1.8} strokeLinecap="round" />

      {/* Sensor on front post — above frame, centred */}
      <Line x1={32} y1={38} x2={32} y2={26} stroke={frame} strokeWidth={1.6} strokeLinecap="round" />
      <Rect x={26} y={18} width={12} height={8} rx={1} fill={HW.sensorBlue} stroke={HW.sensorBlueLight} strokeWidth={0.45} />
      <Circle cx={29} cy={21} r={1.4} fill={HW.sensorVent} opacity={0.75} />
      <Circle cx={35} cy={21} r={1.4} fill={HW.sensorVent} opacity={0.75} />

      {/* Wires along frame edges only */}
      <Path d="M 32 26 L 32 38" fill="none" stroke={HW.wireYellow} strokeWidth={0.9} />
      <Path d="M 38 46 L 46 46" fill="none" stroke={HW.wireGreen} strokeWidth={0.9} strokeLinecap="round" />
      <Circle cx={32} cy={38} r={2.2} fill={frame} stroke={joint} strokeWidth={0.55} />
    </CardWrap>
  );
}

export function SkillLevelIllustration({ tier, accent = false }: { tier: ExperienceLevel; accent?: boolean }) {
  switch (tier) {
    case 'beginner':
      return <BeginnerCardArt accent={accent} />;
    case 'intermediate':
      return <IntermediateCardArt accent={accent} />;
    case 'advanced':
      return <AdvancedCardArt accent={accent} />;
  }
}
