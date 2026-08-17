import { useRouter } from 'expo-router';

import { InterestsScreen } from '@/components/onboarding/InterestsScreen';
import { useOnboarding } from '@/context/onboarding-context';

export default function OnboardingInterestsRoute() {
  const router = useRouter();
  const { selectedInterestIds, toggleInterest } = useOnboarding();

  return (
    <InterestsScreen
      selectedIds={selectedInterestIds}
      onToggle={toggleInterest}
      onBack={() => router.back()}
      onContinue={() => router.push('/onboarding/ready')}
    />
  );
}
