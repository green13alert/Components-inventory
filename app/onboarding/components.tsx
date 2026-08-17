import { useRouter } from 'expo-router';

import { ComponentsScreen } from '@/components/onboarding/ComponentsScreen';
import { useOnboarding } from '@/context/onboarding-context';

export default function OnboardingComponentsRoute() {
  const router = useRouter();
  const { selectedComponentIds, toggleComponent } = useOnboarding();

  return (
    <ComponentsScreen
      selectedIds={selectedComponentIds}
      onToggle={toggleComponent}
      onBack={() => router.back()}
      onContinue={() => router.push('/onboarding/interests')}
    />
  );
}
