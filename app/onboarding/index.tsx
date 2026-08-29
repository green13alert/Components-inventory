import { useRouter } from 'expo-router';

import { OnboardingSkipDevButton } from '@/components/dev/onboarding-shortcuts';
import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { DEV_ONBOARDING_SHORTCUTS } from '@/constants/onboarding-dev';

export default function OnboardingWelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onContinue={() => router.push('/onboarding/experience')}
      onLogIn={() => router.push({ pathname: '/onboarding/login', params: { from: 'welcome' } })}
      skipControl={
        DEV_ONBOARDING_SHORTCUTS ? (
          <OnboardingSkipDevButton onPress={() => router.replace('/(tabs)')} />
        ) : undefined
      }
    />
  );
}
