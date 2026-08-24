import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { HW } from '@/constants/component-illustration-palette';
import { SolderiColors } from '@/constants/colors';
import {
  resolveComponentIllustration,
  type ComponentIllustrationId,
} from '@/constants/component-illustrations';

type ComponentIllustrationProps = {
  id?: string;
  name?: string;
  size?: number;
  plate?: boolean;
  /** When false, skips the SVG ground ellipse (e.g. workbench uses BenchComponentShadow). */
  showGroundShadow?: boolean;
};

export function ComponentIllustration({
  id,
  name,
  size = 48,
  plate = true,
  showGroundShadow = true,
}: ComponentIllustrationProps) {
  const illustrationId = resolveComponentIllustration({ id, name });
  const inner = size * 0.88;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {plate ? (
        <View
          style={[
            styles.plate,
            {
              width: size - 2,
              height: size - 2,
              borderRadius: size * 0.2,
            },
          ]}
        />
      ) : null}
      <View style={styles.art}>
        <IllustrationArt id={illustrationId} size={inner} showGroundShadow={showGroundShadow} />
      </View>
    </View>
  );
}

function IllustrationArt({
  id,
  size,
  showGroundShadow,
}: {
  id: ComponentIllustrationId;
  size: number;
  showGroundShadow: boolean;
}) {
  switch (id) {
    case 'arduino-uno':
      return <ArduinoUno size={size} showGroundShadow={showGroundShadow} />;
    case 'esp32':
      return <Esp32 size={size} showGroundShadow={showGroundShadow} />;
    case 'servo-sg90':
      return <Servo size={size} showGroundShadow={showGroundShadow} />;
    case 'hc-sr04':
      return <HcSr04 size={size} showGroundShadow={showGroundShadow} />;
    case 'oled':
      return <Oled size={size} showGroundShadow={showGroundShadow} />;
    case 'dht11':
      return <Dht11 size={size} showGroundShadow={showGroundShadow} />;
    case 'led':
      return <Led size={size} showGroundShadow={showGroundShadow} />;
    case 'resistor':
      return <Resistor size={size} showGroundShadow={showGroundShadow} />;
    case 'dc-motor':
      return <DcMotor size={size} showGroundShadow={showGroundShadow} />;
    case 'breadboard':
      return <Breadboard size={size} showGroundShadow={showGroundShadow} />;
    case 'pir-sensor':
      return <PirSensor size={size} showGroundShadow={showGroundShadow} />;
    case 'lcd-display':
      return <LcdDisplay size={size} showGroundShadow={showGroundShadow} />;
    case 'relay-module':
      return <RelayModule size={size} showGroundShadow={showGroundShadow} />;
    case 'bluetooth-module':
      return <BluetoothModule size={size} showGroundShadow={showGroundShadow} />;
    case 'battery':
      return <Battery size={size} showGroundShadow={showGroundShadow} />;
    case 'motor-driver':
      return <MotorDriver size={size} showGroundShadow={showGroundShadow} />;
    case 'jumper-wires':
      return <JumperWires size={size} showGroundShadow={showGroundShadow} />;
    case 'generic-sensor':
      return <GenericSensor size={size} showGroundShadow={showGroundShadow} />;
    case 'generic-board':
      return <GenericBoard size={size} showGroundShadow={showGroundShadow} />;
    case 'generic-motor':
      return <DcMotor size={size} showGroundShadow={showGroundShadow} />;
    case 'generic-display':
      return <Oled size={size} showGroundShadow={showGroundShadow} />;
    case 'electronics-kit':
      return <ElectronicsKit size={size} showGroundShadow={showGroundShadow} />;
    default:
      return <GenericModule size={size} showGroundShadow={showGroundShadow} />;
  }
}

/** Ground shadow — dark is intentional; component body stays bright. */
function GroundShadow() {
  return <Ellipse cx={32} cy={54} rx={22} ry={4} fill={HW.dropShadow} opacity={0.45} />;
}

type IllustrationProps = {
  size: number;
  showGroundShadow?: boolean;
};

function IllustrationSvg({
  size,
  showGroundShadow = true,
  children,
}: IllustrationProps & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {showGroundShadow ? <GroundShadow /> : null}
      {children}
    </Svg>
  );
}

/** Top-left sheen shared across the library. */
function TopSheen({ x, y, w, h, rx = 0 }: { x: number; y: number; w: number; h: number; rx?: number }) {
  return (
    <Rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={HW.highlight}
      opacity={0.35}
    />
  );
}

function PinRow({
  x,
  y,
  count,
  spacing = 4,
}: {
  x: number;
  y: number;
  count: number;
  spacing?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Rect
          key={i}
          x={x + i * spacing}
          y={y}
          width={1.8}
          height={5}
          rx={0.4}
          fill={HW.pinGold}
        />
      ))}
    </>
  );
}

function ArduinoUno({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Main board — familiar Arduino teal-blue */}
      <Rect x={10} y={20} width={44} height={28} rx={2.5} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.8} />
      <TopSheen x={12} y={21} w={28} h={6} rx={1} />
      {/* USB connector */}
      <Rect x={6} y={28} width={7} height={12} rx={1} fill={HW.usbSilver} stroke={HW.metalDark} strokeWidth={0.5} />
      <Rect x={7} y={30} width={5} height={8} rx={0.5} fill={HW.metalLight} />
      {/* IC chip */}
      <Rect x={24} y={28} width={16} height={12} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.5} />
      <TopSheen x={25} y={29} w={10} h={3} rx={0.5} />
      {/* Power LED */}
      <Circle cx={46} cy={26} r={2.2} fill={HW.ledGreen} />
      <Circle cx={46} cy={26} r={1} fill={HW.highlightSoft} />
      {/* Pin headers */}
      <PinRow x={14} y={14} count={12} spacing={3.2} />
      <PinRow x={14} y={50} count={12} spacing={3.2} />
      {/* Silkscreen traces */}
      {[22, 26, 30, 34, 38].map((y) => (
        <Line key={y} x1={16} y1={y} x2={48} y2={y} stroke={HW.pcbBlueHighlight} strokeWidth={0.5} opacity={0.35} />
      ))}
    </IllustrationSvg>
  );
}

function Esp32({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Dark green PCB — recognisable ESP32 colour */}
      <Rect x={12} y={18} width={40} height={28} rx={2} fill={HW.pcbGreenMid} stroke={HW.pcbGreen} strokeWidth={0.8} />
      <TopSheen x={14} y={19} w={24} h={5} rx={1} />
      {/* Metal RF shield — bright silver, high contrast */}
      <Rect x={20} y={24} width={18} height={14} rx={1.5} fill={HW.metalLight} stroke={HW.metalDark} strokeWidth={0.6} />
      <Rect x={22} y={26} width={14} height={10} rx={1} fill={HW.metalLight} opacity={0.5} />
      <TopSheen x={21} y={25} w={10} h={4} rx={0.5} />
      {/* Antenna area */}
      <Path d="M 44 22 L 54 16 L 54 20 L 44 24 Z" fill={HW.pcbGreenLight} stroke={HW.pcbGreen} strokeWidth={0.4} />
      {/* Pin rows */}
      <PinRow x={14} y={14} count={10} spacing={3.6} />
      <PinRow x={14} y={50} count={10} spacing={3.6} />
      {/* Status LED */}
      <Circle cx={38} cy={22} r={1.5} fill={HW.ledRed} />
    </IllustrationSvg>
  );
}

function Servo({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Blue SG90 body */}
      <Rect x={14} y={30} width={36} height={20} rx={3} fill={HW.servoBlue} stroke={HW.servoBlueDark} strokeWidth={0.8} />
      <TopSheen x={16} y={31} w={24} h={5} rx={1} />
      {/* Bottom mounting ears */}
      <Rect x={10} y={36} width={6} height={8} rx={1.5} fill={HW.servoBlue} stroke={HW.servoBlueDark} strokeWidth={0.5} />
      <Rect x={48} y={36} width={6} height={8} rx={1.5} fill={HW.servoBlue} stroke={HW.servoBlueDark} strokeWidth={0.5} />
      {/* White horn */}
      <Circle cx={32} cy={24} r={11} fill={HW.servoWhite} stroke={HW.metalDark} strokeWidth={0.7} />
      <TopSheen x={24} y={16} w={12} h={6} rx={3} />
      <Path d="M 32 14 L 38 24 L 32 28 L 26 24 Z" fill={HW.servoBlueLight} stroke={HW.servoBlueDark} strokeWidth={0.5} />
      {/* Cable */}
      <Path d="M 50 38 Q 56 36 58 42" stroke={HW.wireYellow} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 50 42 Q 56 44 58 48" stroke={HW.wireRed} strokeWidth={2} fill="none" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

function HcSr04({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={8} y={26} width={48} height={16} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.8} />
      <TopSheen x={10} y={27} w={30} h={4} rx={1} />
      {/* Ultrasonic transducers — silver cylinders */}
      <Circle cx={22} cy={34} r={9} fill={HW.metalLight} stroke={HW.metalDark} strokeWidth={0.8} />
      <Circle cx={22} cy={34} r={6} fill={HW.metal} />
      <Circle cx={22} cy={32} r={2.5} fill={HW.metalLight} opacity={0.7} />
      <Circle cx={42} cy={34} r={9} fill={HW.metalLight} stroke={HW.metalDark} strokeWidth={0.8} />
      <Circle cx={42} cy={34} r={6} fill={HW.metal} />
      <Circle cx={42} cy={32} r={2.5} fill={HW.metalLight} opacity={0.7} />
      {/* Pin header */}
      <PinRow x={28} y={18} count={4} spacing={4} />
    </IllustrationSvg>
  );
}

function Oled({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Blue PCB frame */}
      <Rect x={12} y={20} width={40} height={26} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.8} />
      <TopSheen x={14} y={21} w={26} h={5} rx={1} />
      {/* Dark OLED panel with visible glow */}
      <Rect x={16} y={24} width={32} height={18} rx={1.5} fill={HW.screenDark} stroke={HW.screenMid} strokeWidth={0.8} />
      <Rect x={18} y={26} width={28} height={14} rx={1} fill={HW.screenMid} opacity={0.6} />
      <Line x1={20} y1={30} x2={44} y2={30} stroke={HW.screenGlow} strokeWidth={1} opacity={0.75} />
      <Line x1={20} y1={34} x2={38} y2={34} stroke={HW.screenGlow} strokeWidth={0.8} opacity={0.55} />
      <Line x1={20} y1={38} x2={42} y2={38} stroke={HW.screenGlow} strokeWidth={0.8} opacity={0.4} />
      {/* Pin header */}
      <PinRow x={22} y={14} count={4} spacing={5} />
    </IllustrationSvg>
  );
}

function Dht11({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Blue plastic housing */}
      <Rect x={16} y={16} width={32} height={32} rx={4} fill={HW.sensorBlue} stroke={HW.sensorBlueLight} strokeWidth={0.8} />
      <TopSheen x={18} y={17} w={20} h={8} rx={2} />
      {/* Vent grid */}
      <Rect x={20} y={24} width={24} height={16} rx={2} fill={HW.sensorVent} stroke={HW.sensorBlueLight} strokeWidth={0.5} />
      {[22, 26, 30, 34, 38, 42].map((x) =>
        [26, 30, 34, 38].map((y) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.2} fill={HW.sensorBlueLight} opacity={0.65} />
        )),
      )}
      {/* Pins */}
      <PinRow x={24} y={50} count={3} spacing={8} />
    </IllustrationSvg>
  );
}

function Led({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Red dome with bright highlight */}
      <Ellipse cx={32} cy={26} rx={11} ry={10} fill={HW.ledRed} stroke="#B91C1C" strokeWidth={0.6} />
      <Ellipse cx={32} cy={23} rx={7} ry={5} fill={HW.ledRedGlow} opacity={0.65} />
      <Ellipse cx={29} cy={21} rx={3} ry={2} fill={HW.highlight} opacity={0.55} />
      {/* Clear base */}
      <Rect x={28} y={34} width={8} height={6} rx={1} fill={HW.metalLight} opacity={0.85} />
      {/* Legs */}
      <Rect x={29} y={40} width={2} height={12} rx={0.5} fill={HW.pinSilver} />
      <Rect x={33} y={40} width={2} height={12} rx={0.5} fill={HW.pinSilver} />
      <Line x1={30} y1={52} x2={26} y2={58} stroke={HW.pinSilver} strokeWidth={1.4} strokeLinecap="round" />
      <Line x1={34} y1={52} x2={38} y2={58} stroke={HW.pinSilver} strokeWidth={1.4} strokeLinecap="round" />
    </IllustrationSvg>
  );
}

function Resistor({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Leads */}
      <Line x1={10} y1={32} x2={18} y2={32} stroke={HW.pinSilver} strokeWidth={1.6} strokeLinecap="round" />
      <Line x1={46} y1={32} x2={54} y2={32} stroke={HW.pinSilver} strokeWidth={1.6} strokeLinecap="round" />
      {/* Beige body */}
      <Rect x={18} y={26} width={28} height={12} rx={6} fill={HW.resistorBody} stroke="#B8A888" strokeWidth={0.7} />
      <TopSheen x={20} y={27} w={16} h={4} rx={2} />
      {/* Colour bands */}
      <Rect x={22} y={27} width={3.5} height={10} rx={1} fill={HW.bandBrown} />
      <Rect x={28} y={27} width={3.5} height={10} rx={1} fill={HW.bandRed} />
      <Rect x={34} y={27} width={3.5} height={10} rx={1} fill={HW.bandGold} />
      <Rect x={40} y={27} width={3.5} height={10} rx={1} fill={HW.bandGold} />
    </IllustrationSvg>
  );
}

function DcMotor({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Motor body */}
      <Rect x={14} y={26} width={30} height={22} rx={4} fill={HW.motorBodyLight} stroke={HW.motorBody} strokeWidth={0.8} />
      <TopSheen x={16} y={27} w={18} h={6} rx={2} />
      {/* End cap */}
      <Circle cx={44} cy={37} r={9} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.7} />
      <Circle cx={44} cy={37} r={5} fill={HW.motorBodyLight} />
      {/* Shaft */}
      <Rect x={50} y={35} width={10} height={4} rx={1} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.5} />
      <TopSheen x={51} y={35.5} w={6} h={1.5} rx={0.5} />
      {/* Wires */}
      <Path d="M 20 48 Q 14 52 12 56" stroke={HW.wireRed} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M 26 48 Q 22 54 20 58" stroke={HW.wireBlack} strokeWidth={2} fill="none" strokeLinecap="round" />
    </IllustrationSvg>
  );
}

function Breadboard({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* White body */}
      <Rect x={8} y={22} width={48} height={24} rx={2} fill={HW.breadWhite} stroke={HW.breadCream} strokeWidth={0.8} />
      <TopSheen x={10} y={23} w={32} h={6} rx={1} />
      {/* Power rails */}
      <Rect x={10} y={24} width={44} height={2.5} rx={0.5} fill={HW.railRed} opacity={0.85} />
      <Rect x={10} y={41} width={44} height={2.5} rx={0.5} fill={HW.railBlue} opacity={0.85} />
      {/* Tie points */}
      {[16, 22, 28, 34, 40, 46].map((x) =>
        [30, 36].map((y) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} fill={HW.breadHole} />
        )),
      )}
      <Line x1={10} y1={33} x2={54} y2={33} stroke={HW.breadCream} strokeWidth={0.6} />
    </IllustrationSvg>
  );
}

function PirSensor({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={14} y={28} width={36} height={16} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.7} />
      <TopSheen x={16} y={29} w={22} h={4} rx={1} />
      {/* White dome */}
      <Circle cx={32} cy={30} r={9} fill="#FAFAF5" stroke={HW.breadCream} strokeWidth={0.7} />
      <Ellipse cx={32} cy={27} rx={5} ry={3} fill={HW.highlightSoft} />
      <PinRow x={26} y={18} count={3} spacing={6} />
    </IllustrationSvg>
  );
}

function LcdDisplay({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Gray bezel */}
      <Rect x={6} y={24} width={52} height={20} rx={2} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.7} />
      <TopSheen x={8} y={25} w={30} h={4} rx={1} />
      {/* Green/yellow LCD panel */}
      <Rect x={10} y={28} width={44} height={12} rx={1} fill="#C4D97E" stroke="#A3B85C" strokeWidth={0.6} />
      <Line x1={14} y1={32} x2={50} y2={32} stroke="#5C6B2E" strokeWidth={0.8} opacity={0.55} />
      <Line x1={14} y1={36} x2={46} y2={36} stroke="#5C6B2E" strokeWidth={0.8} opacity={0.4} />
      <PinRow x={18} y={16} count={8} spacing={3.5} />
    </IllustrationSvg>
  );
}

function RelayModule({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={10} y={22} width={44} height={22} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.7} />
      <TopSheen x={12} y={23} w={26} h={5} rx={1} />
      {/* Relay block */}
      <Rect x={16} y={26} width={16} height={14} rx={1} fill={HW.relayBlack} stroke={HW.relayCoil} strokeWidth={0.6} />
      <TopSheen x={17} y={27} w={10} h={4} rx={0.5} />
      {/* Blue relay */}
      <Rect x={36} y={26} width={12} height={14} rx={1} fill={HW.sensorBlueLight} stroke={HW.sensorBlue} strokeWidth={0.6} />
      <Circle cx={42} cy={33} r={3} fill={HW.servoWhite} opacity={0.8} />
      <PinRow x={18} y={14} count={4} spacing={5} />
    </IllustrationSvg>
  );
}

function BluetoothModule({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={12} y={24} width={40} height={18} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.7} />
      <TopSheen x={14} y={25} w={24} h={4} rx={1} />
      {/* HC-05 style module */}
      <Rect x={18} y={28} width={20} height={10} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.5} />
      <Path d="M 28 30 L 34 34 L 28 38 L 22 34 Z" fill={HW.sensorBlueLight} opacity={0.85} />
      <PinRow x={20} y={16} count={4} spacing={6} />
    </IllustrationSvg>
  );
}

function Battery({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={14} y={26} width={36} height={18} rx={3} fill={HW.batteryBlack} stroke={HW.metalDark} strokeWidth={0.7} />
      <TopSheen x={16} y={27} w={22} h={5} rx={1.5} />
      <Rect x={26} y={22} width={12} height={4} rx={1} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.5} />
      {/* Red label stripe */}
      <Rect x={18} y={30} width={28} height={8} rx={1} fill={HW.batteryRed} opacity={0.9} />
      <Line x1={22} y1={34} x2={42} y2={34} stroke={HW.highlight} strokeWidth={0.8} opacity={0.4} />
    </IllustrationSvg>
  );
}

function MotorDriver({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={8} y={22} width={48} height={22} rx={2} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.7} />
      <TopSheen x={10} y={23} w={30} h={5} rx={1} />
      {/* L298N-style heatsink */}
      <Rect x={14} y={26} width={18} height={14} rx={1} fill={HW.metal} stroke={HW.metalDark} strokeWidth={0.6} />
      {[16, 20, 24, 28, 30].map((y) => (
        <Line key={y} x1={15} y1={y} x2={31} y2={y} stroke={HW.metalDark} strokeWidth={0.4} opacity={0.5} />
      ))}
      {/* Terminal blocks */}
      <Rect x={36} y={26} width={14} height={14} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.5} />
      <Rect x={38} y={28} width={4} height={10} rx={0.5} fill={HW.wireGreen} />
      <Rect x={44} y={28} width={4} height={10} rx={0.5} fill={HW.wireRed} />
      <PinRow x={16} y={14} count={6} spacing={4} />
    </IllustrationSvg>
  );
}

function JumperWires({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Path d="M 12 42 Q 22 18 34 34 T 52 26" stroke={HW.wireRed} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 16 46 Q 28 32 40 42" stroke={HW.wireYellow} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Path d="M 20 38 Q 32 48 46 36" stroke={HW.wireGreen} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <Circle cx={12} cy={42} r={3} fill={HW.wireRed} />
      <Circle cx={52} cy={26} r={3} fill={HW.wireRed} />
      <Circle cx={46} cy={36} r={3} fill={HW.wireGreen} />
    </IllustrationSvg>
  );
}

/** Empty-state cluster — generic parts, not one identifiable product. */
function ElectronicsKit({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      {/* Generic PCB */}
      <Rect
        x={12}
        y={16}
        width={30}
        height={18}
        rx={2}
        fill={HW.pcbBlue}
        stroke={HW.pcbBlueDark}
        strokeWidth={0.7}
      />
      <TopSheen x={14} y={17} w={16} h={4} rx={1} />
      <Rect x={18} y={21} width={14} height={8} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.45} />
      <TopSheen x={19} y={21.5} w={7} h={2} rx={0.4} />
      {[16, 20, 24, 28, 32].map((x) => (
        <Rect key={x} x={x} y={30} width={1.6} height={4} rx={0.3} fill={HW.pinGold} />
      ))}
      <Circle cx={38} cy={20} r={1.6} fill={SolderiColors.accent} />
      <Circle cx={38} cy={20} r={0.6} fill={HW.highlight} opacity={0.7} />

      {/* Generic sensor / module */}
      <Rect
        x={40}
        y={18}
        width={14}
        height={16}
        rx={2}
        fill={HW.sensorBlue}
        stroke={HW.sensorBlueLight}
        strokeWidth={0.6}
      />
      <TopSheen x={41.5} y={19} w={8} h={3.5} rx={1} />
      {[43, 47, 51].map((x) =>
        [24, 28].map((y) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill={HW.sensorVent} opacity={0.7} />
        )),
      )}

      {/* Resistor */}
      <Line x1={8} y1={44} x2={14} y2={44} stroke={HW.pinSilver} strokeWidth={1.3} strokeLinecap="round" />
      <Line x1={32} y1={44} x2={38} y2={44} stroke={HW.pinSilver} strokeWidth={1.3} strokeLinecap="round" />
      <Rect x={14} y={40} width={18} height={8} rx={4} fill={HW.resistorBody} stroke="#B8A888" strokeWidth={0.5} />
      <TopSheen x={16} y={41} w={8} h={2.5} rx={1} />
      <Rect x={17} y={41} width={2.2} height={6} rx={0.6} fill={HW.bandBrown} />
      <Rect x={21} y={41} width={2.2} height={6} rx={0.6} fill={HW.bandRed} />
      <Rect x={26} y={41} width={2.2} height={6} rx={0.6} fill={HW.bandGold} />

      {/* Wires */}
      <Path d="M 42 34 Q 50 38 48 48" stroke={HW.wireRed} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path
        d="M 40 34 Q 44 42 54 46"
        stroke={SolderiColors.accent}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx={48} cy={48} r={2} fill={HW.wireRed} />
      <Circle cx={54} cy={46} r={2} fill={SolderiColors.accent} />

      {/* Small LED */}
      <Ellipse cx={44} cy={42} rx={3.2} ry={3} fill={HW.ledRed} />
      <Ellipse cx={43} cy={41} rx={1.4} ry={1} fill={HW.ledRedGlow} opacity={0.7} />
    </IllustrationSvg>
  );
}

function GenericSensor({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={16} y={20} width={32} height={26} rx={3} fill={HW.genericBlue} stroke={HW.pcbBlueDark} strokeWidth={0.7} />
      <TopSheen x={18} y={21} w={20} h={6} rx={1.5} />
      <Circle cx={32} cy={32} r={8} fill={HW.metalLight} stroke={HW.metalDark} strokeWidth={0.7} />
      <Circle cx={32} cy={30} r={3} fill={HW.highlightSoft} />
      <PinRow x={24} y={50} count={3} spacing={8} />
    </IllustrationSvg>
  );
}

function GenericBoard({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={12} y={18} width={40} height={28} rx={2.5} fill={HW.pcbBlue} stroke={HW.pcbBlueDark} strokeWidth={0.8} />
      <TopSheen x={14} y={19} w={26} h={6} rx={1} />
      <Rect x={20} y={26} width={24} height={14} rx={1.5} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.5} />
      <PinRow x={16} y={12} count={8} spacing={3.5} />
      <PinRow x={16} y={50} count={8} spacing={3.5} />
    </IllustrationSvg>
  );
}

function GenericModule({ size, showGroundShadow = true }: IllustrationProps) {
  return (
    <IllustrationSvg size={size} showGroundShadow={showGroundShadow}>
      <Rect x={14} y={22} width={36} height={22} rx={2} fill={HW.genericGreen} stroke={HW.pcbGreen} strokeWidth={0.7} />
      <TopSheen x={16} y={23} w={22} h={5} rx={1} />
      <Rect x={20} y={28} width={24} height={10} rx={1} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.5} />
      <PinRow x={20} y={14} count={4} spacing={6} />
    </IllustrationSvg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
