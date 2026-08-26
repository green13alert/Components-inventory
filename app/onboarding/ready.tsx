import { useRouter } from 'expo-router';

import { ReadyScreen } from '@/components/onboarding/ReadyScreen';
import { useOnboarding } from '@/context/onboarding-context';

export default function OnboardingReadyRoute() {
  const router = useRouter();
  const { summary, recommendedProjects } = useOnboarding();

  return (
    <ReadyScreen
      experienceLabel={summary.experienceLabel}
      componentCount={summary.componentCount}
      interestSummary={summary.interestSummary}
      projects={recommendedProjects}
      onBack={() => router.back()}
      onFinish={() => router.push('/onboarding/sign-up')}
    />
  );
}
