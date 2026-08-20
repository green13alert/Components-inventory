import { G } from 'react-native-svg';

import {
  AerospaceArt,
  AutomationArt,
  ComputingArt,
  ElectronicsArt,
  InterestIllustrationById,
  MechanicalArt,
  RoboticsArt,
  SmartHomeArt,
  VehiclesArt,
} from '@/components/onboarding/interests/InterestIllustrationArt';
import type { OnboardingInterest } from '@/constants/onboarding';

export { InterestIllustrationById };

type Props = {
  id: OnboardingInterest['id'];
  size?: number;
  accent?: boolean;
};

/** Detailed card illustration — 64×64 viewBox, shared art language with hero scene. */
export function InterestCardIllustration({ id, accent = false }: Props) {
  switch (id) {
    case 'robotics':
      return <RoboticsArt accent={accent} />;
    case 'aerospace':
      return <AerospaceArt accent={accent} />;
    case 'mechanical':
      return <MechanicalArt accent={accent} />;
    case 'electronics':
      return <ElectronicsArt accent={accent} />;
    case 'smart-home':
      return <SmartHomeArt accent={accent} />;
    case 'vehicles':
      return <VehiclesArt accent={accent} />;
    case 'computing':
      return <ComputingArt accent={accent} />;
    case 'automation':
      return <AutomationArt accent={accent} />;
    default:
      return null;
  }
}

/** Scaled card art placed on the hero workbench (same illustrator, hero layout). */
export function HeroScaledInterest({
  id,
  x,
  y,
  scale,
  accent = false,
}: {
  id: OnboardingInterest['id'];
  x: number;
  y: number;
  scale: number;
  accent?: boolean;
}) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale}) translate(-32 -36)`}>
      <InterestIllustrationById id={id} accent={accent} />
    </G>
  );
}
