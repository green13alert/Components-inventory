import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  CONVEYOR_BELT,
  gearPath,
  HeroArmSceneGraphic,
  HeroConveyorGraphic,
  HeroConveyorPackagesSceneGraphic,
  HeroGearSceneGraphic,
  HeroRocketGraphic,
  HeroSmartHomeGraphic,
  HeroVehicleSceneGraphic,
  HeroWorkbenchEnvironment,
} from '@/components/onboarding/interests/InterestIllustrationArt';
import { HW } from '@/constants/component-illustration-palette';
import { SolderiColors } from '@/constants/colors';

const VB_W = 360;
const VB_H = 200;

const ARM_ORIGIN = { x: 108, y: 128 };
const GEAR_LARGE_ORIGIN = { x: 228, y: 112 };
const GEAR_SMALL_ORIGIN = { x: 248, y: 122 };

type InterestsHeroAnimationProps = {
  width: number;
  height: number;
  selectedIds: string[];
};

function TopSheen({ x, y, w, h, rx = 0 }: { x: number; y: number; w: number; h: number; rx?: number }) {
  return <Rect x={x} y={y} width={w} height={h} rx={rx} fill={HW.highlight} opacity={0.3} />;
}

function useSceneRotation(shared: SharedValue<number>, setter: (v: number) => void) {
  useAnimatedReaction(
    () => shared.value,
    (value) => {
      runOnJS(setter)(value);
    },
    [shared],
  );
}

/** Map monotonic slide value to (-period, 0] — 0 and -period render identically. */
function useSceneSlideLoop(shared: SharedValue<number>, setter: (v: number) => void, period: number) {
  useAnimatedReaction(
    () => shared.value,
    (value) => {
      const m = ((value % period) + period) % period;
      runOnJS(setter)(m === 0 ? 0 : m - period);
    },
    [shared],
  );
}

function useSceneAngleLoop(shared: SharedValue<number>, setter: (v: number) => void) {
  useAnimatedReaction(
    () => shared.value,
    (value) => {
      runOnJS(setter)(((value % 360) + 360) % 360);
    },
    [shared],
  );
}

/** Hero scene — animated parts use SVG rotation/translate in scene coords (reliable on iOS). */
export function InterestsHeroAnimation({ width, height, selectedIds }: InterestsHeroAnimationProps) {
  const selected = new Set(selectedIds);

  const armRot = useSharedValue(-8);
  const gearRot = useSharedValue(0);
  const ledA = useSharedValue(0.25);
  const ledB = useSharedValue(0.25);
  const rocketLight = useSharedValue(0.2);
  const screenA = useSharedValue(0.2);
  const screenB = useSharedValue(0.2);
  const screenC = useSharedValue(0.2);
  const conveyorX = useSharedValue(0);
  const wheelRot = useSharedValue(0);
  const vehicleX = useSharedValue(0);
  const homeGlow = useSharedValue(0.4);
  const autoPulse = useSharedValue(0.35);

  const [armDeg, setArmDeg] = useState(-8);
  const [gearDeg, setGearDeg] = useState(0);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [conveyorTx, setConveyorTx] = useState(0);
  const [vehicleTx, setVehicleTx] = useState(0);
  const [ledAOp, setLedAOp] = useState(0.25);
  const [ledBOp, setLedBOp] = useState(0.25);
  const [rocketOp, setRocketOp] = useState(0.2);
  const [screenAOp, setScreenAOp] = useState(0.2);
  const [screenBOp, setScreenBOp] = useState(0.2);
  const [screenCOp, setScreenCOp] = useState(0.2);
  const [homeOp, setHomeOp] = useState(0.4);
  const [autoOp, setAutoOp] = useState(0.35);

  useSceneRotation(armRot, setArmDeg);
  useSceneRotation(gearRot, setGearDeg);
  useSceneAngleLoop(wheelRot, setWheelDeg);
  useSceneSlideLoop(conveyorX, setConveyorTx, CONVEYOR_BELT.spacing);
  useSceneRotation(vehicleX, setVehicleTx);
  useSceneRotation(ledA, setLedAOp);
  useSceneRotation(ledB, setLedBOp);
  useSceneRotation(rocketLight, setRocketOp);
  useSceneRotation(screenA, setScreenAOp);
  useSceneRotation(screenB, setScreenBOp);
  useSceneRotation(screenC, setScreenCOp);
  useSceneRotation(homeGlow, setHomeOp);
  useSceneRotation(autoPulse, setAutoOp);

  useEffect(() => {
    const armMin = -8;
    const armMax = 14;
    armRot.value = armMin;
    armRot.value = withRepeat(
      withTiming(armMax, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    gearRot.value = withRepeat(withTiming(360, { duration: 5000, easing: Easing.linear }), -1, false);
    ledA.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.2, { duration: 700 })),
      -1,
      true,
    );
    ledB.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 400 }),
        withTiming(1, { duration: 700 }),
        withTiming(0.2, { duration: 700 }),
      ),
      -1,
      false,
    );
    rocketLight.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0.15, { duration: 900 })),
      -1,
      true,
    );
    screenA.value = withRepeat(
      withSequence(withTiming(0.95, { duration: 1100 }), withTiming(0.15, { duration: 1100 })),
      -1,
      true,
    );
    screenB.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 500 }),
        withTiming(0.85, { duration: 1100 }),
        withTiming(0.15, { duration: 1100 }),
      ),
      -1,
      false,
    );
    screenC.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 900 }),
        withTiming(0.75, { duration: 1100 }),
        withTiming(0.15, { duration: 1100 }),
      ),
      -1,
      false,
    );
    const beltStep = CONVEYOR_BELT.spacing;
    const beltLoops = 500;
    conveyorX.value = withRepeat(
      withTiming(-beltStep * beltLoops, { duration: 2200 * beltLoops, easing: Easing.linear }),
      -1,
      false,
    );
    const wheelLoops = 500;
    wheelRot.value = withRepeat(
      withTiming(360 * wheelLoops, { duration: 2000 * wheelLoops, easing: Easing.linear }),
      -1,
      false,
    );
    vehicleX.value = withRepeat(
      withSequence(
        withTiming(2.5, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(-1.5, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    homeGlow.value = withRepeat(
      withSequence(withTiming(0.95, { duration: 1600 }), withTiming(0.35, { duration: 1600 })),
      -1,
      true,
    );
    autoPulse.value = withRepeat(
      withSequence(withTiming(0.9, { duration: 1200 }), withTiming(0.3, { duration: 1200 })),
      -1,
      true,
    );
  }, [armRot, autoPulse, conveyorX, gearRot, homeGlow, ledA, ledB, rocketLight, screenA, screenB, screenC, vehicleX, wheelRot]);

  const roboticsActive = selected.has('robotics');
  const aerospaceActive = selected.has('aerospace');
  const mechanicalActive = selected.has('mechanical');
  const electronicsActive = selected.has('electronics');
  const computingActive = selected.has('computing');
  const vehiclesActive = selected.has('vehicles');
  const automationActive = selected.has('automation');
  const smartHomeActive = selected.has('smart-home');

  const joint = (active: boolean) => (active ? SolderiColors.accent : '#E87722');

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#32373B" />
            <Stop offset="1" stopColor="#212528" />
          </LinearGradient>
          <LinearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={SolderiColors.surfaceElevated} />
            <Stop offset="1" stopColor={SolderiColors.surface} />
          </LinearGradient>
          <ClipPath id="beltClip">
            <Rect x={CONVEYOR_BELT.innerX} y={CONVEYOR_BELT.frameY} width={CONVEYOR_BELT.innerW} height={CONVEYOR_BELT.frameH} />
          </ClipPath>
        </Defs>

        <Rect x={4} y={4} width={352} height={192} rx={14} fill="url(#frameGrad)" stroke={SolderiColors.border} strokeWidth={1} />
        <HeroWorkbenchEnvironment />

        <G>
          <Ellipse cx={52} cy={138} rx={28} ry={5} fill="#000" opacity={0.22} />
          <Rect x={28} y={118} width={48} height={20} rx={2} fill={HW.breadWhite} stroke={electronicsActive ? SolderiColors.accentBorder : HW.breadHole} strokeWidth={0.5} />
          <TopSheen x={30} y={119} w={30} h={4} rx={1} />
          {[32, 36, 40, 44, 48, 52, 56, 60, 64, 68].map((hx) =>
            [124, 128, 132].map((hy) => <Circle key={`${hx}-${hy}`} cx={hx} cy={hy} r={0.6} fill={HW.breadHole} opacity={0.5} />),
          )}
          <Rect x={34} y={104} width={36} height={18} rx={1.5} fill={HW.pcbGreenMid} stroke={HW.pcbGreen} strokeWidth={0.5} />
          <Rect x={40} y={108} width={14} height={10} rx={0.8} fill={HW.icBlack} stroke={HW.icPin} strokeWidth={0.4} />
          <Line x1={38} y1={112} x2={34} y2={122} stroke={HW.wireYellow} strokeWidth={1.2} />
          <Line x1={56} y1={110} x2={62} y2={120} stroke={HW.wireGreen} strokeWidth={1.2} />
          <Ellipse cx={44} cy={125} rx={4} ry={3} fill={HW.ledRedGlow} opacity={0.25} />
          <Circle cx={44} cy={126} r={2.8} fill={electronicsActive ? SolderiColors.accent : HW.ledRed} opacity={ledAOp} />
          <Circle cx={58} cy={124} r={2.2} fill={HW.ledGreen} opacity={ledBOp} />
        </G>

        {/* Robotic arm base + shoulder joint (static) */}
        <G>
          <Ellipse cx={118} cy={138} rx={26} ry={5} fill="#000" opacity={0.2} />
          <Rect x={94} y={128} width={28} height={8} rx={2} fill="#525C65" stroke="#454B50" strokeWidth={0.5} />
          <TopSheen x={96} y={129} w={16} h={2} rx={0.5} />
          {[98, 104, 110, 116].map((bx) => (
            <Circle key={bx} cx={bx} cy={132} r={1.1} fill={HW.metalDark} />
          ))}
          <Circle cx={ARM_ORIGIN.x} cy={ARM_ORIGIN.y} r={6} fill="#6B7280" stroke="#4B5563" strokeWidth={0.6} />
          <Circle cx={ARM_ORIGIN.x} cy={ARM_ORIGIN.y} r={3} fill={joint(roboticsActive)} />
        </G>

        {/* Arm segments — rotate around shoulder joint in scene space */}
        <G rotation={armDeg} originX={ARM_ORIGIN.x} originY={ARM_ORIGIN.y}>
          <HeroArmSceneGraphic accent={roboticsActive} />
        </G>

        <HeroRocketGraphic accent={aerospaceActive} />
        <Circle cx={178} cy={96} r={2.5} fill={SolderiColors.accent} opacity={rocketOp} />
        <Circle cx={174} cy={102} r={1.8} fill="#DC2626" opacity={rocketOp} />

        {/* Gear mount (static) */}
        <G>
          <Ellipse cx={238} cy={136} rx={22} ry={4} fill="#000" opacity={0.18} />
          <Rect x={214} y={126} width={32} height={8} rx={2} fill={HW.motorBody} stroke={HW.motorShaft} strokeWidth={0.4} />
        </G>

        <G rotation={gearDeg} originX={GEAR_LARGE_ORIGIN.x} originY={GEAR_LARGE_ORIGIN.y}>
          <HeroGearSceneGraphic
            cx={GEAR_LARGE_ORIGIN.x}
            cy={GEAR_LARGE_ORIGIN.y}
            outerR={16}
            innerR={11.5}
            teeth={12}
            accent={mechanicalActive}
          />
        </G>

        <G rotation={-gearDeg * 1.35} originX={GEAR_SMALL_ORIGIN.x} originY={GEAR_SMALL_ORIGIN.y}>
          <Path
            d={gearPath(GEAR_SMALL_ORIGIN.x, GEAR_SMALL_ORIGIN.y, 10, 7, 8)}
            fill={HW.metalLight}
            stroke={HW.metalDark}
            strokeWidth={0.5}
          />
          <Circle cx={GEAR_SMALL_ORIGIN.x} cy={GEAR_SMALL_ORIGIN.y} r={3} fill={HW.metal} />
        </G>

        <G>
          <Ellipse cx={296} cy={138} rx={24} ry={4} fill="#000" opacity={0.18} />
          <Rect x={272} y={96} width={48} height={34} rx={2.5} fill="#374151" stroke={computingActive ? SolderiColors.accentBorder : '#525C65'} strokeWidth={0.6} />
          <TopSheen x={276} y={98} w={28} h={5} rx={1} />
          <Rect x={278} y={102} width={36} height={24} rx={1.5} fill={HW.screenDark} stroke={HW.screenMid} strokeWidth={0.5} />
          <Rect x={282} y={108} width={28} height={2.5} rx={1} fill={HW.screenGlow} opacity={screenAOp} />
          <Rect x={282} y={114} width={22} height={2} rx={1} fill={HW.screenGlow} opacity={screenBOp} />
          <Rect x={282} y={120} width={26} height={2} rx={1} fill={HW.screenGlow} opacity={screenCOp} />
          <Rect x={288} y={130} width={16} height={4} rx={1} fill={HW.metalDark} />
          <Rect x={284} y={134} width={24} height={3} rx={0.5} fill={HW.metal} />
        </G>

        <HeroSmartHomeGraphic accent={smartHomeActive} />
        <Rect x={318} y={124} width={6} height={5} rx={0.5} fill="#38BDF8" opacity={homeOp} />

        <G>
          <Ellipse cx={66} cy={152} rx={28} ry={4} fill="#000" opacity={0.2} />
        </G>

        {/* Vehicle — slides on bench; wheels spin in scene space */}
        <G translateX={vehicleTx}>
          <HeroVehicleSceneGraphic accent={vehiclesActive} wheelRotation={wheelDeg} />
        </G>

        <HeroConveyorGraphic accent={automationActive} />
        <Circle cx={266} cy={127} r={1.5} fill={HW.ledGreen} opacity={autoOp} />
        <Circle cx={272} cy={127} r={1.5} fill={HW.ledRed} opacity={autoOp} />

        <G clipPath="url(#beltClip)">
          <G translateX={CONVEYOR_BELT.innerX + conveyorTx}>
            <HeroConveyorPackagesSceneGraphic />
          </G>
        </G>

        {selectedIds.length > 0 ? (
          <Rect x={4} y={4} width={352} height={192} rx={14} fill={SolderiColors.accent} opacity={0.035} />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
  },
});
