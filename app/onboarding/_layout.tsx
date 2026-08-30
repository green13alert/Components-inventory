import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/context/onboarding-context';
import { useSolderiColors } from '@/context/theme-context';

export default function OnboardingLayout() {
  const colors = useSolderiColors();

  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
          gestureEnabled: true,
        }}
      />
    </OnboardingProvider>
  );
}
