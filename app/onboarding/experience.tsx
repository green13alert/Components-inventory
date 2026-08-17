import { useRouter } from 'expo-router';

import { ExperienceScreen } from '@/components/onboarding/ExperienceScreen';
import { useOnboarding } from '@/context/onboarding-context';

export default function OnboardingExperienceRoute() {
  const router = useRouter();
  const { experience, setExperience } = useOnboarding();

  return (
    <ExperienceScreen
      selected={experience}
      onSelect={setExperience}
      onBack={() => router.back()}
      onContinue={() => router.push('/onboarding/components')}
    />
  );
}
