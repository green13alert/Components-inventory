import { Stack } from 'expo-router';

import { SolderiColors } from '@/constants/colors';
import { OnboardingProvider } from '@/context/onboarding-context';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: SolderiColors.background },
          gestureEnabled: true,
        }}
      />
    </OnboardingProvider>
  );
}
