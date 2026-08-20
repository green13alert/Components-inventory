import { type ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { HW } from '@/constants/component-illustration-palette';
import { SolderiColors } from '@/constants/colors';
import type { OnboardingInterest } from '@/constants/onboarding';

type AccentProps = { accent?: boolean };

function TopSheen({ x, y, w, h, rx = 0 }: { x: number; y: number; w: number; h: number; rx?: number }) {
  return <Rect x={x} y={y} width={w} height={h} rx={rx} fill={HW.highlight} opacity={0.32} />;
}

function GroundShadow({ cx = 32, cy = 54, rx = 22 }: { cx?: number; cy?: number; rx?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={4} fill={HW.dropShadow} opacity={0.42} />;
}

/** Gear path with visible teeth — shared across mechanical + hero. */
export function gearPath(cx: number, cy: number, outerR: number, innerR: number, teeth: number): string {
  const step = (Math.PI * 2) / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step - Math.PI / 2;
    const a1 = a0 + step * 0.22;
    const a2 = a0 + step * 0.5;
    const a3 = a0 + step * 0.72;
    const ox0 = cx + Math.cos(a0) * outerR;
    const oy0 = cy + Math.sin(a0) * outerR;
    const ox1 = cx + Math.cos(a1) * outerR;
    const oy1 = cy + Math.sin(a1) * outerR;
    const ix1 = cx + Math.cos(a1) * innerR;
    const iy1 = cy + Math.sin(a1) * innerR;
    const ix2 = cx + Math.cos(a2) * innerR;
    const iy2 = cy + Math.sin(a2) * innerR;
    const ox2 = cx + Math.cos(a3) * outerR;
    const oy2 = cy + Math.sin(a3) * outerR;
    d += i === 0 ? `M ${ox0} ${oy0}` : '';
    d += ` L ${ox1} ${oy1} L ${ix1} ${iy1} L ${ix2} ${iy2} L ${ox2} ${oy2}`;
  }
  return `${d} Z`;
}

function CardWrap({ children }: { children: ReactNode }) {
  return (
    <G>
      <GroundShadow />
      {children}
    </G>
  );
}

/** Industrial robotic arm — base → joints → segments → gripper. */
export function RoboticsArt({ accent = false }: AccentProps) {
  const joint = accent ? SolderiColors.accent : '#E87722';
  const armFill = '#6B7280';
  const armDark = '#4B5563';
  const baseFill = '#525C65';

  return (
    <CardWrap>
      <Rect x={16} y={46} width={32} height={9} rx={2} fill={baseFill} stroke={armDark} strokeWidth={0.6} />
      <TopSheen x={18} y={47} w={20} h={3} rx={1} />
      {[20, 26, 32, 38].map((bx) => (
        <Circle key={bx} cx={bx} cy={50.5} r={1.1} fill={HW.metalDark} />
      ))}
      <Circle cx={32} cy={46} r={5.5} fill={armFill} stroke={armDark} strokeWidth={0.7} />
      <Circle cx={32} cy={46} r={2.8} fill={joint} />
      <Path
        d="M 32 40.5 L 32 30 L 42 24 L 46 27"
        fill="none"
        stroke={joint}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={29} y={28} width={6} height={5} rx={1.5} fill={armFill} stroke={armDark} strokeWidth={0.5} />
      <Path d="M 46 27 L 52 20 L 56 22 L 52 28" fill="none" stroke={armFill} strokeWidth={3.6} strokeLinecap="round" />
      <Circle cx={46} cy={27} r={3.4} fill={armFill} stroke={joint} strokeWidth={0.8} />
      <Path d="M 52 20 L 56 17.5 M 52 22.5 L 56 24.5" stroke={HW.metalLight} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={55} cy={21} r={1.6} fill={HW.servoBlue} />
      <Ellipse cx={55} cy={20.5} rx={1} ry={0.6} fill={HW.highlightSoft} />
    </CardWrap>
  );
}

/** Detailed rocket with nose, body panels, fins, engine. */
export function AerospaceArt({ accent = false }: AccentProps) {
  const body = '#E8EDF2';
  const panel = '#C5CDD6';
  const fin = '#889099';

  return (
    <CardWrap>
      <Rect x={22} y={52} width={20} height={4} rx={1} fill={HW.metalDark} />
      <Rect x={24} y={50} width={16} height={2} rx={0.5} fill={HW.metal} />
      <Path d="M 28 50 L 32 14 L 36 50 Z" fill={body} stroke={accent ? SolderiColors.accentBorder : panel} strokeWidth={0.7} />
      <TopSheen x={30} y={18} w={4} h={14} rx={1} />
      <Rect x={29} y={28} width={6} height={10} rx={1} fill={panel} opacity={0.55} />
      <Circle cx={32} cy={32} r={2.2} fill={HW.screenMid} stroke={HW.metalDark} strokeWidth={0.4} />
      <Circle cx={32} cy={32} r={1} fill={HW.screenGlow} opacity={0.7} />
      <Path d="M 28 46 L 24 52 L 28 50 Z" fill={fin} stroke={HW.metalDark} strokeWidth={0.4} />
      <Path d="M 36 46 L 40 52 L 36 50 Z" fill={fin} stroke={HW.metalDark} strokeWidth={0.4} />
      <Path d="M 30 50 L 32 54 L 34 50 Z" fill="#DC2626" opacity={0.85} />
      <Rect x={29} y={48} width={6} height={3} rx={0.5} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.3} />
      {[30, 32, 34].map((lx) => (
        <Line key={lx} x1={lx} y1={22} x2={lx} y2={44} stroke={panel} strokeWidth={0.4} opacity={0.5} />
      ))}
    </CardWrap>
  );
}

/** Two meshed gears on a mount — simple, reads correctly at card size. */
export function MechanicalArt({ accent = false }: AccentProps) {
  const gold = accent ? SolderiColors.accent : '#C9A227';
  const bronze = '#A67C3D';
  const drive = { cx: 28, cy: 34, outerR: 11, innerR: 7.5, teeth: 10 };
  const driven = {
    cx: 28 + 11 + 8 - 2,
    cy: 34,
    outerR: 8,
    innerR: 5.5,
    teeth: 8,
  };

  return (
    <CardWrap>
      <Rect x={12} y={48} width={40} height={7} rx={2} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.5} />
      <TopSheen x={14} y={49} w={24} h={2} rx={0.5} />
      <Path
        d={gearPath(driven.cx, driven.cy, driven.outerR, driven.innerR, driven.teeth)}
        fill={HW.metalLight}
        stroke={HW.metalDark}
        strokeWidth={0.5}
      />
      <Circle cx={driven.cx} cy={driven.cy} r={2.5} fill={HW.metal} />
      <Path
        d={gearPath(drive.cx, drive.cy, drive.outerR, drive.innerR, drive.teeth)}
        fill={gold}
        stroke={bronze}
        strokeWidth={0.6}
      />
      <Circle cx={drive.cx} cy={drive.cy} r={3.5} fill={bronze} stroke={HW.motorShaft} strokeWidth={0.4} />
    </CardWrap>
  );
}

/** Breadboard with components plugged in (pins down, rails top/bottom). */
export function ElectronicsArt({ accent = false }: AccentProps) {
  return (
    <CardWrap>
      <Rect x={8} y={28} width={48} height={22} rx={2} fill={HW.breadWhite} stroke={HW.breadHole} strokeWidth={0.6} />
      <TopSheen x={10} y={29} w={32} h={4} rx={1} />
      <Rect x={10} y={30} width={44} height={2} rx={0.5} fill={HW.railRed} opacity={0.85} />
      <Rect x={10} y={46} width={44} height={2} rx={0.5} fill={HW.railBlue} opacity={0.85} />
      <Line x1={10} y1={39} x2={54} y2={39} stroke={HW.breadCream} strokeWidth={0.6} />
      {[16, 22, 28, 34, 40, 46].map((hx) =>
        [34, 44].map((hy) => <Circle key={`${hx}-${hy}`} cx={hx} cy={hy} r={0.7} fill={HW.breadHole} opacity={0.55} />),
      )}
      {/* DIP IC straddling centre trench — pins into breadboard */}
      <Rect x={24} y={32} width={16} height={6} rx={0.6} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.4} />
      <TopSheen x={26} y={33} w={10} h={2} rx={0.3} />
      {[26, 29, 32, 35].map((px) => (
        <Rect key={`ic-l-${px}`} x={px} y={38} width={1.2} height={3} rx={0.3} fill={HW.pinGold} />
      ))}
      {[29, 32, 35, 38].map((px) => (
        <Rect key={`ic-r-${px}`} x={px} y={38} width={1.2} height={3} rx={0.3} fill={HW.pinGold} />
      ))}
      {/* Resistor + LED on lower row */}
      <Ellipse cx={42} cy={43} rx={4} ry={1.6} fill={HW.resistorBody} stroke={HW.bandBrown} strokeWidth={0.3} />
      <Line x1={38} y1={43} x2={36} y2={43} stroke={HW.pinGold} strokeWidth={0.8} />
      <Line x1={46} y1={43} x2={48} y2={43} stroke={HW.pinGold} strokeWidth={0.8} />
      <Circle cx={18} cy={43} r={2.2} fill={accent ? SolderiColors.accent : HW.ledRed} stroke="#B91C1C" strokeWidth={0.4} />
      <Line x1={18} y1={45.2} x2={18} y2={47} stroke={HW.pinGold} strokeWidth={0.8} />
      <Line x1={20.2} y1={43} x2={22} y2={43} stroke={HW.pinGold} strokeWidth={0.8} />
      <Line x1={22} y1={43} x2={26} y2={38} stroke={HW.wireYellow} strokeWidth={1.1} />
      <Line x1={40} y1={38} x2={44} y2={43} stroke={HW.wireGreen} strokeWidth={1.1} />
    </CardWrap>
  );
}

/** Modern house + smart hub + wireless indicator. */
export function SmartHomeArt({ accent = false }: AccentProps) {
  const wall = '#EDE8E0';
  const roof = '#7A8490';
  const trim = accent ? SolderiColors.accentBorder : '#98A3AC';

  return (
    <CardWrap>
      <Rect x={14} y={50} width={36} height={3} rx={0.5} fill={HW.metalDark} opacity={0.5} />
      <Rect x={16} y={36} width={32} height={14} rx={1} fill={wall} stroke={trim} strokeWidth={0.55} />
      <Path d="M 12 36 L 32 16 L 52 36 Z" fill={roof} stroke={trim} strokeWidth={0.55} />
      <Rect x={38} y={22} width={5} height={10} rx={0.5} fill="#8B7355" stroke="#6B5344" strokeWidth={0.4} />
      <Rect x={18} y={40} width={10} height={8} rx={1} fill={HW.screenMid} stroke={HW.metalDark} strokeWidth={0.4} />
      <Line x1={23} y1={40} x2={23} y2={48} stroke={HW.metalDark} strokeWidth={0.35} />
      <Rect x={20} y={42} width={3} height={3} rx={0.3} fill="#38BDF8" opacity={accent ? 0.95 : 0.55} />
      <Rect x={32} y={41} width={8} height={9} rx={1} fill="#8B7355" stroke="#6B5344" strokeWidth={0.4} />
      <Circle cx={38} cy={45} r={0.7} fill={HW.pinGold} />
      <Rect x={44} y={42} width={9} height={10} rx={2} fill="#2A2E31" stroke={HW.metalDark} strokeWidth={0.45} />
      <Rect x={46} y={45} width={5} height={5} rx={1} fill="#38BDF8" opacity={0.75} />
      <Path d="M 53 40 Q 57 36 60 40" stroke={HW.screenGlow} strokeWidth={0.9} fill="none" opacity={0.55} />
    </CardWrap>
  );
}

/** Side-view vehicle with body, windows, lights, wheels. */
export function VehiclesArt({ accent = false }: AccentProps) {
  const body = '#2563EB';
  const bodyDark = '#1D4ED8';

  return (
    <CardWrap>
      <Path
        d="M 8 38 L 12 38 L 14 34 L 18 28 L 40 28 L 46 30 L 50 34 L 52 38 L 52 42 L 8 42 Z"
        fill={body}
        stroke={accent ? SolderiColors.accentBorder : bodyDark}
        strokeWidth={0.65}
        strokeLinejoin="round"
      />
      <TopSheen x={20} y={29} w={20} h={3} rx={0.5} />
      <Path d="M 19 28 L 21 24 L 39 24 L 41 28 Z" fill={HW.screenMid} stroke={bodyDark} strokeWidth={0.45} />
      <Line x1={30} y1={24} x2={30} y2={28} stroke={bodyDark} strokeWidth={0.4} />
      <Circle cx={12} cy={37} r={1.8} fill="#FDE68A" />
      <Rect x={50} y={36} width={2.5} height={1.5} rx={0.4} fill="#FCA5A5" />
      <Circle cx={20} cy={44} r={5} fill="#1F2937" stroke="#111827" strokeWidth={0.55} />
      <Circle cx={20} cy={44} r={2.2} fill={HW.metal} />
      <Circle cx={42} cy={44} r={5} fill="#1F2937" stroke="#111827" strokeWidth={0.55} />
      <Circle cx={42} cy={44} r={2.2} fill={HW.metal} />
    </CardWrap>
  );
}

/** Monitor + tower + keyboard hint. */
export function ComputingArt({ accent = false }: AccentProps) {
  return (
    <CardWrap>
      <Rect x={14} y={18} width={36} height={24} rx={2} fill="#374151" stroke={accent ? SolderiColors.accentBorder : '#525C65'} strokeWidth={0.6} />
      <TopSheen x={16} y={19} w={22} h={4} rx={1} />
      <Rect x={18} y={22} width={28} height={16} rx={1} fill={HW.screenDark} stroke={HW.screenMid} strokeWidth={0.5} />
      <Line x1={21} y1={26} x2={38} y2={26} stroke={HW.screenGlow} strokeWidth={0.9} opacity={0.75} />
      <Line x1={21} y1={30} x2={34} y2={30} stroke={HW.screenGlow} strokeWidth={0.7} opacity={0.55} />
      <Line x1={21} y1={34} x2={36} y2={34} stroke={HW.screenGlow} strokeWidth={0.7} opacity={0.4} />
      <Rect x={26} y={42} width={12} height={3} rx={1} fill={HW.metalDark} />
      <Rect x={22} y={45} width={20} height={2} rx={0.5} fill={HW.metal} />
      <Rect x={44} y={28} width={10} height={22} rx={1.5} fill="#1F2937" stroke="#374151" strokeWidth={0.5} />
      <Circle cx={49} cy={32} r={1.2} fill={HW.ledGreen} />
      <Rect x={46} y={36} width={6} height={1} rx={0.3} fill={HW.metalDark} opacity={0.6} />
      <Rect x={10} y={48} width={28} height={6} rx={1} fill="#2A2E31" stroke={HW.metalDark} strokeWidth={0.4} />
      {[12, 15, 18, 21, 24, 27, 30, 33].map((kx) => (
        <Rect key={kx} x={kx} y={49.5} width={2} height={3} rx={0.3} fill={HW.metalLight} opacity={0.55} />
      ))}
    </CardWrap>
  );
}

/** Factory cell — gantry beside conveyor, arm reaches over the belt. */
export function AutomationArt({ accent = false }: AccentProps) {
  const joint = jointColor(accent);
  const armFill = '#6B7280';
  const beltY = 44;

  return (
    <CardWrap>
      {/* Control cabinet on the floor, right */}
      <Rect x={48} y={30} width={12} height={22} rx={2} fill="#525C65" stroke="#78838C" strokeWidth={0.5} />
      <TopSheen x={49} y={31} w={8} h={4} rx={0.5} />
      <Rect x={50} y={34} width={8} height={7} rx={1} fill={HW.screenDark} />
      <Circle cx={52} cy={36} r={1} fill={HW.ledGreen} />
      <Circle cx={56} cy={36} r={1} fill={HW.ledRed} />
      <Rect x={51} y={43} width={3} height={3} rx={0.5} fill={HW.metalLight} />
      <Rect x={55} y={43} width={3} height={3} rx={0.5} fill={HW.metalLight} />

      {/* Conveyor belt */}
      <Rect x={18} y={beltY} width={36} height={8} rx={2} fill="#78838C" stroke={accent ? SolderiColors.accentBorder : '#525C65'} strokeWidth={0.5} />
      <TopSheen x={20} y={beltY + 1} w={24} h={2} rx={0.5} />
      {[22, 30, 38, 46].map((rx) => (
        <Circle key={rx} cx={rx} cy={beltY + 4} r={2.5} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.3} />
      ))}
      <Rect x={24} y={beltY - 4} width={9} height={4} rx={1} fill={HW.motorBodyLight} stroke={HW.motorShaft} strokeWidth={0.35} />
      <Rect x={36} y={beltY - 4} width={9} height={4} rx={1} fill={HW.motorBodyLight} stroke={HW.motorShaft} strokeWidth={0.35} />

      {/* Gantry robot beside the belt — base on floor, post, arm over belt */}
      <Rect x={8} y={48} width={12} height={4} rx={1} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.4} />
      <Rect x={11} y={24} width={5} height={24} rx={1} fill={armFill} stroke="#4B5563" strokeWidth={0.45} />
      <TopSheen x={12} y={25} w={3} h={8} rx={0.5} />
      <Circle cx={13.5} cy={24} r={3} fill={armFill} stroke="#4B5563" strokeWidth={0.5} />
      <Circle cx={13.5} cy={24} r={1.5} fill={joint} />
      <Path
        d="M 16.5 24 L 34 24 L 34 37"
        fill="none"
        stroke={joint}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={34} cy={37} r={2} fill={armFill} stroke={joint} strokeWidth={0.5} />
      <Path d="M 32.5 36 L 35.5 36 M 34 34.5 L 34 38.5" stroke={HW.metalLight} strokeWidth={1.5} strokeLinecap="round" />
    </CardWrap>
  );
}

function jointColor(accent: boolean) {
  return accent ? SolderiColors.accent : '#E87722';
}

const CARD_ART: Record<OnboardingInterest['id'], (props: AccentProps) => ReactNode> = {
  robotics: RoboticsArt,
  aerospace: AerospaceArt,
  mechanical: MechanicalArt,
  electronics: ElectronicsArt,
  'smart-home': SmartHomeArt,
  vehicles: VehiclesArt,
  computing: ComputingArt,
  automation: AutomationArt,
};

export function InterestIllustrationById({ id, accent = false }: { id: OnboardingInterest['id']; accent?: boolean }) {
  const Art = CARD_ART[id];
  return <Art accent={accent} />;
}

/** Hero workstation environment — back wall, shelf, bench, lighting. */
export function HeroWorkbenchEnvironment() {
  return (
    <G>
      <Rect x={0} y={0} width={360} height={118} fill="#25292D" />
      <Rect x={0} y={0} width={360} height={118} fill="url(#wallGrad)" opacity={0.5} />
      <Rect x={12} y={24} width={336} height={28} rx={3} fill="#2F3438" stroke="#3A4044" strokeWidth={0.6} />
      <TopSheen x={16} y={26} w={120} h={6} rx={1} />
      <Rect x={20} y={28} width={22} height={14} rx={1.5} fill="#3A4044" stroke={HW.metalDark} strokeWidth={0.4} />
      <Rect x={48} y={30} width={18} height={12} rx={1} fill={HW.pcbBlueDark} opacity={0.8} />
      <Rect x={72} y={29} width={28} height={13} rx={1} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.4} />
      <Path d="M 118 28 L 128 22 L 138 28 L 138 42 L 118 42 Z" fill={HW.metalDark} opacity={0.7} />
      <Circle cx={128} cy={24} r={3} fill={HW.metal} />
      <Line x1={108} y1={38} x2={148} y2={38} stroke={HW.metalDark} strokeWidth={1.2} opacity={0.5} />
      <Ellipse cx={180} cy={20} rx={40} ry={12} fill="#FFB547" opacity={0.12} />
      <Path d="M 168 8 L 180 0 L 192 8 L 190 18 L 170 18 Z" fill={HW.metalLight} stroke={HW.metalDark} strokeWidth={0.5} />
      <Rect x={176} y={18} width={8} height={14} rx={1} fill={HW.metal} />
      <Ellipse cx={180} cy={34} rx={52} ry={8} fill="#FFB547" opacity={0.08} />
      <Path d="M 16 128 L 344 128 L 352 148 L 8 148 Z" fill="#3A4044" stroke="#454B50" strokeWidth={0.6} />
      <Path d="M 8 148 L 352 148 L 360 168 L 0 168 Z" fill="#2A2E31" stroke="#363B3E" strokeWidth={0.5} />
      <Line x1={16} y1={130} x2={344} y2={130} stroke={HW.highlightSoft} strokeWidth={0.8} opacity={0.35} />
      <Circle cx={28} cy={134} r={1.5} fill={HW.metal} opacity={0.6} />
      <Circle cx={42} cy={136} r={1.2} fill={HW.pinGold} opacity={0.55} />
      <Ellipse cx={180} cy={158} rx={150} ry={14} fill="#000" opacity={0.2} />
      <Path d="M 90 132 Q 110 128 130 132" stroke={HW.wireRed} strokeWidth={1.4} fill="none" opacity={0.55} />
      <Path d="M 200 134 Q 220 130 240 134" stroke={HW.wireYellow} strokeWidth={1.2} fill="none" opacity={0.45} />
    </G>
  );
}

/** Detailed rocket prototype for hero scene (scene coordinates). */
export function HeroRocketGraphic({ cx = 178, accent = false }: { cx?: number; accent?: boolean }) {
  const body = '#E8EDF2';
  const panel = '#C5CDD6';
  const fin = '#889099';
  const stroke = accent ? SolderiColors.accentBorder : '#98A3AC';

  return (
    <G>
      <Ellipse cx={cx} cy={138} rx={18} ry={4} fill="#000" opacity={0.2} />
      <Rect x={cx - 14} y={132} width={28} height={5} rx={1.5} fill={HW.metalDark} />
      <Rect x={cx - 10} y={130} width={20} height={2} rx={0.5} fill={HW.metal} />
      {/* Body cylinder + nose */}
      <Path
        d={`M ${cx - 8} 132 L ${cx - 8} 104 Q ${cx - 8} 96 ${cx} 88 Q ${cx + 8} 96 ${cx + 8} 104 L ${cx + 8} 132 Z`}
        fill={body}
        stroke={stroke}
        strokeWidth={0.7}
      />
      <Path d={`M ${cx} 88 L ${cx - 5} 104 L ${cx + 5} 104 Z`} fill="#F8FAFC" stroke={panel} strokeWidth={0.5} />
      <TopSheen x={cx - 3} y={92} w={6} h={16} rx={1} />
      <Rect x={cx - 4} y={108} width={8} height={14} rx={1} fill={panel} opacity={0.45} />
      <Circle cx={cx} cy={114} r={3} fill={HW.screenMid} stroke={HW.metalDark} strokeWidth={0.4} />
      <Circle cx={cx} cy={114} r={1.2} fill={HW.screenGlow} opacity={0.75} />
      {/* Fins */}
      <Path d={`M ${cx - 8} 126 L ${cx - 14} 134 L ${cx - 8} 132 Z`} fill={fin} stroke={HW.metalDark} strokeWidth={0.4} />
      <Path d={`M ${cx + 8} 126 L ${cx + 14} 134 L ${cx + 8} 132 Z`} fill={fin} stroke={HW.metalDark} strokeWidth={0.4} />
      {/* Engine */}
      <Path d={`M ${cx - 5} 132 L ${cx} 138 L ${cx + 5} 132 Z`} fill="#DC2626" opacity={0.85} />
      <Rect x={cx - 4} y={130} width={8} height={4} rx={0.5} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.3} />
      {[cx - 4, cx, cx + 4].map((lx) => (
        <Line key={lx} x1={lx} y1={98} x2={lx} y2={124} stroke={panel} strokeWidth={0.4} opacity={0.45} />
      ))}
    </G>
  );
}

/** Smart-home house for hero scene — clear readable silhouette. */
export function HeroSmartHomeGraphic({ accent = false }: AccentProps) {
  const wall = '#EDE8E0';
  const wallDark = '#D6D0C8';
  const roof = '#7A8490';
  const trim = accent ? SolderiColors.accentBorder : '#98A3AC';

  return (
    <G>
      <Ellipse cx={322} cy={142} rx={26} ry={4} fill="#000" opacity={0.18} />
      {/* Foundation */}
      <Rect x={300} y={140} width={44} height={4} rx={1} fill={HW.metalDark} opacity={0.55} />
      {/* Main walls */}
      <Rect x={302} y={124} width={40} height={16} rx={1} fill={wall} stroke={trim} strokeWidth={0.55} />
      <TopSheen x={306} y={125} w={22} h={5} rx={0.5} />
      {/* Roof with overhang */}
      <Path d="M 298 124 L 322 102 L 346 124 Z" fill={roof} stroke={trim} strokeWidth={0.6} />
      <Path d="M 302 124 L 322 106 L 342 124 Z" fill={wallDark} opacity={0.35} />
      {/* Chimney */}
      <Rect x={334} y={108} width={6} height={12} rx={0.5} fill="#8B7355" stroke="#6B5344" strokeWidth={0.4} />
      <Rect x={333} y={106} width={8} height={3} rx={0.5} fill={HW.metalDark} />
      {/* Left window — two panes */}
      <Rect x={306} y={128} width={12} height={9} rx={1} fill={HW.screenMid} stroke={HW.metalDark} strokeWidth={0.45} />
      <Line x1={312} y1={128} x2={312} y2={137} stroke={HW.metalDark} strokeWidth={0.4} />
      <Line x1={306} y1={132.5} x2={318} y2={132.5} stroke={HW.metalDark} strokeWidth={0.4} />
      <Rect x={308} y={130} width={3} height={4} rx={0.3} fill="#38BDF8" opacity={0.6} />
      {/* Door + step */}
      <Rect x={322} y={129} width={10} height={11} rx={1} fill="#8B7355" stroke="#6B5344" strokeWidth={0.45} />
      <Circle cx={329} cy={135} r={0.9} fill={HW.pinGold} />
      <Rect x={320} y={140} width={14} height={2} rx={0.5} fill={HW.metal} />
      {/* Smart hub on porch */}
      <Rect x={336} y={130} width={11} height={13} rx={2} fill="#2A2E31" stroke={HW.metalDark} strokeWidth={0.5} />
      <Rect x={339} y={134} width={5} height={6} rx={1} fill="#38BDF8" opacity={0.75} />
      <Circle cx={341.5} cy={135.5} r={1} fill={HW.ledGreen} opacity={0.8} />
      <Path d="M 348 128 Q 352 124 356 128" stroke={HW.screenGlow} strokeWidth={0.9} fill="none" opacity={0.55} />
      <Path d="M 349 126 Q 354 120 358 126" stroke={HW.screenGlow} strokeWidth={0.7} fill="none" opacity={0.4} />
    </G>
  );
}

/** Full conveyor belt assembly — all geometry from CONVEYOR_BELT (single source of truth). */
export const CONVEYOR_BELT = {
  frameX: 148,
  frameY: 144,
  frameW: 120,
  frameH: 10,
  innerX: 152,
  innerY: 146.5,
  innerW: 112,
  innerH: 5,
  rollerY: 149,
  rollerSpacing: 12,
  rollerInset: 6,
  packageY: 147,
  packageW: 10,
  packageH: 4,
  spacing: 12,
  shadowCx: 204,
  shadowCy: 152,
  shadowRx: 52,
  cabinetX: 258,
  cabinetY: 118,
} as const;

function conveyorRollerXs(): number[] {
  const { innerX, innerW, rollerInset, rollerSpacing } = CONVEYOR_BELT;
  const rollers: number[] = [];
  for (let x = innerX + rollerInset; x <= innerX + innerW - rollerInset; x += rollerSpacing) {
    rollers.push(x);
  }
  return rollers;
}

export function HeroConveyorGraphic({ accent = false }: AccentProps) {
  const b = CONVEYOR_BELT;
  const frameEnd = b.frameX + b.frameW;

  return (
    <G>
      <Ellipse cx={b.shadowCx} cy={b.shadowCy} rx={b.shadowRx} ry={4} fill="#000" opacity={0.16} />
      {/* Side rails */}
      <Rect x={b.frameX - 2} y={b.frameY - 2} width={4} height={12} rx={1} fill="#525C65" stroke="#454B50" strokeWidth={0.4} />
      <Rect x={frameEnd - 2} y={b.frameY - 2} width={4} height={12} rx={1} fill="#525C65" stroke="#454B50" strokeWidth={0.4} />
      {/* Belt frame + surface */}
      <Rect x={b.frameX} y={b.frameY} width={b.frameW} height={b.frameH} rx={2} fill="#78838C" stroke={accent ? SolderiColors.accentBorder : '#525C65'} strokeWidth={0.55} />
      <TopSheen x={b.innerX} y={b.frameY + 1} w={70} h={2} rx={0.5} />
      <Rect x={b.innerX} y={b.innerY} width={b.innerW} height={b.innerH} rx={1} fill="#626C75" />
      {/* Rollers */}
      {conveyorRollerXs().map((rx) => (
        <G key={rx}>
          <Circle cx={rx} cy={b.rollerY} r={3.2} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.35} />
          <Circle cx={rx} cy={b.rollerY} r={1.2} fill={HW.motorBodyLight} opacity={0.6} />
        </G>
      ))}
      {/* Control cabinet */}
      <Rect x={b.cabinetX} y={b.cabinetY} width={22} height={26} rx={2} fill="#525C65" stroke="#78838C" strokeWidth={0.5} />
      <TopSheen x={b.cabinetX + 2} y={b.cabinetY + 2} w={12} h={4} rx={0.5} />
      <Rect x={b.cabinetX + 4} y={b.cabinetY + 6} width={14} height={10} rx={1} fill={HW.screenDark} stroke={HW.metalDark} strokeWidth={0.35} />
      <Rect x={b.cabinetX + 6} y={b.cabinetY + 18} width={4} height={4} rx={0.5} fill={HW.metalLight} />
      <Rect x={b.cabinetX + 12} y={b.cabinetY + 18} width={4} height={4} rx={0.5} fill={HW.metalLight} />
    </G>
  );
}

/** Conveyor packages in local coords — duplicate at 126 for seamless -18px loop. */
export function HeroConveyorPackagesGraphic() {
  const slots = [0, 18, 36, 54, 72, 90, 108, 126];
  return (
    <>
      {slots.map((x) => (
        <G key={x}>
          <Rect x={x + 2} y={1} width={14} height={6} rx={1} fill={HW.motorBodyLight} stroke={HW.motorShaft} strokeWidth={0.35} />
          <Rect x={x + 4} y={2} width={10} height={2} rx={0.3} fill={HW.highlightSoft} opacity={0.5} />
        </G>
      ))}
    </>
  );
}

/** Side-view vehicle body — local viewBox 0 0 60 36 (wheels separate). */
export function HeroVehicleBodyGraphic({ accent = false }: AccentProps) {
  const body = '#2563EB';
  const bodyDark = '#1D4ED8';
  const glass = '#1E3A5F';

  return (
    <G>
      {/* Body shell — recognisable sedan profile */}
      <Path
        d="M 4 26 L 8 26 L 11 22 L 16 15 L 38 15 L 46 18 L 52 22 L 56 26 L 56 30 L 4 30 Z"
        fill={body}
        stroke={accent ? SolderiColors.accentBorder : bodyDark}
        strokeWidth={0.7}
        strokeLinejoin="round"
      />
      <TopSheen x={18} y={16} w={24} h={4} rx={1} />
      {/* Cabin / windows */}
      <Path
        d="M 17 15 L 19 10 L 37 10 L 41 15 Z"
        fill={glass}
        stroke={bodyDark}
        strokeWidth={0.5}
      />
      <Line x1={28} y1={10} x2={28} y2={15} stroke={bodyDark} strokeWidth={0.45} />
      <Rect x={21} y={11.5} width={5} height={3} rx={0.4} fill={HW.screenGlow} opacity={0.3} />
      <Rect x={31} y={11.5} width={5} height={3} rx={0.4} fill={HW.screenGlow} opacity={0.3} />
      {/* Hood crease + bumper */}
      <Line x1={16} y1={18} x2={10} y2={24} stroke={bodyDark} strokeWidth={0.45} opacity={0.55} />
      <Rect x={3} y={27} width={4} height={3} rx={1} fill={HW.metalDark} />
      <Rect x={53} y={27} width={4} height={3} rx={1} fill={HW.metalDark} />
      {/* Lights */}
      <Circle cx={7} cy={25} r={2} fill="#FDE68A" />
      <Circle cx={7} cy={25} r={0.8} fill="#FFF" opacity={0.7} />
      <Rect x={54} y={24} width={3} height={2} rx={0.5} fill="#FCA5A5" />
      {/* Wheel wells (tyres drawn in spin layer) */}
      <Path d="M 13 30 Q 18 32 23 30" stroke={bodyDark} strokeWidth={0.55} fill="none" />
      <Path d="M 37 30 Q 42 32 47 30" stroke={bodyDark} strokeWidth={0.55} fill="none" />
    </G>
  );
}

/** Single wheel in local 0–12 viewBox (for spin animation). */
export function HeroWheelGraphic() {
  return (
    <>
      <Circle cx={6} cy={6} r={5.5} fill="#1F2937" stroke="#111827" strokeWidth={0.6} />
      <Circle cx={6} cy={6} r={2.2} fill={HW.metal} />
      <Line x1={6} y1={2} x2={6} y2={10} stroke={HW.metalLight} strokeWidth={1} />
      <Line x1={2} y1={6} x2={10} y2={6} stroke={HW.metalLight} strokeWidth={1} />
    </>
  );
}

/** Robotic arm segments drawn in scene coordinates — pivot at (108, 128). */
export function HeroArmSceneGraphic({ accent = false }: AccentProps) {
  const joint = accent ? SolderiColors.accent : '#E87722';
  const ox = 108;
  const oy = 128;

  return (
    <>
      <Path
        d={`M ${ox} ${oy} L ${ox} ${oy - 22} L ${ox + 24} ${oy - 32} L ${ox + 30} ${oy - 26}`}
        fill="none"
        stroke={joint}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={ox - 3} y={oy - 26} width={6} height={6} rx={2} fill="#6B7280" stroke="#4B5563" strokeWidth={0.5} />
      <Path
        d={`M ${ox + 30} ${oy - 26} L ${ox + 44} ${oy - 38} L ${ox + 50} ${oy - 34} L ${ox + 42} ${oy - 24}`}
        fill="none"
        stroke="#6B7280"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={ox + 30} cy={oy - 26} r={4.5} fill="#6B7280" stroke={joint} strokeWidth={0.8} />
      <Path
        d={`M ${ox + 44} ${oy - 38} L ${ox + 50} ${oy - 41} M ${ox + 44} ${oy - 34} L ${ox + 50} ${oy - 31}`}
        stroke={HW.metalLight}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={ox + 48} cy={oy - 36} r={2.2} fill={HW.servoBlue} />
    </>
  );
}

/** Gear at scene coordinates. */
export function HeroGearSceneGraphic({
  cx,
  cy,
  outerR,
  innerR,
  teeth,
  accent,
}: {
  cx: number;
  cy: number;
  outerR: number;
  innerR: number;
  teeth: number;
  accent?: boolean;
}) {
  return <HeroGearGraphic cx={cx} cy={cy} outerR={outerR} innerR={innerR} teeth={teeth} accent={accent} />;
}

/** Full vehicle in scene coords with spinning wheels. */
export function HeroVehicleSceneGraphic({
  accent = false,
  wheelRotation = 0,
}: AccentProps & { wheelRotation?: number }) {
  const body = '#2563EB';
  const bodyDark = '#1D4ED8';
  const glass = '#1E3A5F';
  const wheelL = { x: 54, y: 148 };
  const wheelR = { x: 78, y: 148 };

  return (
    <G>
      <Path
        d="M 40 144 L 46 144 L 49 140 L 54 133 L 76 133 L 82 136 L 88 140 L 92 144 L 92 148 L 40 148 Z"
        fill={body}
        stroke={accent ? SolderiColors.accentBorder : bodyDark}
        strokeWidth={0.7}
        strokeLinejoin="round"
      />
      <TopSheen x={54} y={134} w={24} h={4} rx={1} />
      <Path d="M 55 133 L 57 129 L 75 129 L 77 133 Z" fill={glass} stroke={bodyDark} strokeWidth={0.5} />
      <Line x1={66} y1={129} x2={66} y2={133} stroke={bodyDark} strokeWidth={0.45} />
      <Rect x={59} y={130.5} width={5} height={3} rx={0.4} fill={HW.screenGlow} opacity={0.3} />
      <Rect x={69} y={130.5} width={5} height={3} rx={0.4} fill={HW.screenGlow} opacity={0.3} />
      <Circle cx={43} cy={143} r={2} fill="#FDE68A" />
      <Rect x={90} y={142} width={3} height={2} rx={0.5} fill="#FCA5A5" />
      <Path d="M 49 148 Q 54 150 59 148" stroke={bodyDark} strokeWidth={0.55} fill="none" />
      <Path d="M 73 148 Q 78 150 83 148" stroke={bodyDark} strokeWidth={0.55} fill="none" />
      <G rotation={wheelRotation} originX={wheelL.x} originY={wheelL.y}>
        <Circle cx={wheelL.x} cy={wheelL.y} r={5.5} fill="#1F2937" stroke="#111827" strokeWidth={0.6} />
        <Circle cx={wheelL.x} cy={wheelL.y} r={2.2} fill={HW.metal} />
        <Line x1={wheelL.x} y1={wheelL.y - 4} x2={wheelL.x} y2={wheelL.y + 4} stroke={HW.metalLight} strokeWidth={1} />
        <Line x1={wheelL.x - 4} y1={wheelL.y} x2={wheelL.x + 4} y2={wheelL.y} stroke={HW.metalLight} strokeWidth={1} />
      </G>
      <G rotation={wheelRotation} originX={wheelR.x} originY={wheelR.y}>
        <Circle cx={wheelR.x} cy={wheelR.y} r={5.5} fill="#1F2937" stroke="#111827" strokeWidth={0.6} />
        <Circle cx={wheelR.x} cy={wheelR.y} r={2.2} fill={HW.metal} />
        <Line x1={wheelR.x} y1={wheelR.y - 4} x2={wheelR.x} y2={wheelR.y + 4} stroke={HW.metalLight} strokeWidth={1} />
        <Line x1={wheelR.x - 4} y1={wheelR.y} x2={wheelR.x + 4} y2={wheelR.y} stroke={HW.metalLight} strokeWidth={1} />
      </G>
    </G>
  );
}

/** Packages in belt-local X (0 = inner track left); parent group adds innerX + slide offset. */
export function HeroConveyorPackagesSceneGraphic() {
  const { innerW, rollerInset, packageY, packageW, packageH, spacing } = CONVEYOR_BELT;
  const firstX = rollerInset - packageW / 2;
  const startX = firstX - spacing;
  const endX = innerW + spacing;
  const count = Math.ceil((endX - startX) / spacing) + 1;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = startX + i * spacing;
        return (
          <G key={x}>
            <Rect x={x} y={packageY} width={packageW} height={packageH} rx={0.8} fill={HW.motorBodyLight} stroke={HW.motorShaft} strokeWidth={0.35} />
            <Rect x={x + 1.5} y={packageY + 0.6} width={packageW - 3} height={1.4} rx={0.3} fill={HW.highlightSoft} opacity={0.5} />
          </G>
        );
      })}
    </>
  );
}

/** Robotic arm segments — shoulder pivot at local (0, 36). viewBox 0 0 54 36 */
export function HeroArmSegmentsGraphic({ accent = false }: AccentProps) {
  const joint = accent ? SolderiColors.accent : '#E87722';
  return (
    <>
      <Path
        d="M 0 36 L 0 14 L 24 4 L 30 10"
        fill="none"
        stroke={joint}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={0} y={12} width={6} height={6} rx={2} fill="#6B7280" stroke="#4B5563" strokeWidth={0.5} />
      <Path d="M 30 10 L 44 2 L 50 6 L 42 16" fill="none" stroke="#6B7280" strokeWidth={4} strokeLinecap="round" />
      <Circle cx={30} cy={10} r={4.5} fill="#6B7280" stroke={joint} strokeWidth={0.8} />
      <Path d="M 44 2 L 50 0 M 44 6 L 50 8" stroke={HW.metalLight} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={48} cy={4} r={2.2} fill={HW.servoBlue} />
    </>
  );
}

/** Gear in local viewBox centered at cx,cy */
export function HeroGearGraphic({
  cx,
  cy,
  outerR,
  innerR,
  teeth,
  accent,
}: {
  cx: number;
  cy: number;
  outerR: number;
  innerR: number;
  teeth: number;
  accent?: boolean;
}) {
  const gold = accent ? SolderiColors.accent : '#C9A227';
  return (
    <>
      <Path d={gearPath(cx, cy, outerR, innerR, teeth)} fill={gold} stroke="#A67C3D" strokeWidth={0.6} />
      <Circle cx={cx} cy={cy} r={outerR * 0.32} fill="#A67C3D" />
    </>
  );
}
