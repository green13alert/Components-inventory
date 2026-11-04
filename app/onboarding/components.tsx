import { useRouter } from 'expo-router';

import { ComponentsScreen } from '@/components/onboarding/ComponentsScreen';
import { useOnboarding } from '@/context/onboarding-context';

export default function OnboardingComponentsRoute() {
  const router = useRouter();
  const { selectedComponents, applyOfferQuantities, removeComponent } = useOnboarding();

  return (
    <ComponentsScreen
      selected={selectedComponents}
      onApply={applyOfferQuantities}
      onRemove={removeComponent}
      onBack={() => router.back()}
      onContinue={() => router.push('/onboarding/interests')}
    />
  );
}
