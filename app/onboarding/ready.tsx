import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ReadyScreen } from '@/components/onboarding/ReadyScreen';
import { ONBOARDING_SAVE_ERRORS } from '@/constants/onboarding';
import { useAuth } from '@/context/auth-context';
import { useOnboarding } from '@/context/onboarding-context';
import {
  persistStashedOnboardingSelections,
  stashOnboardingSelections,
} from '@/lib/onboarding-persistence';

export default function OnboardingReadyRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { experience, selectedComponentIds, selectedInterestIds, summary, recommendedProjects } =
    useOnboarding();
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    if (saving) {
      return;
    }

    const selections = {
      skillLevel: experience,
      componentIds: selectedComponentIds,
      interestIds: selectedInterestIds,
    };
    stashOnboardingSelections(selections);

    // Unauthenticated users (and stale local sessions that fail getUser())
    // must continue to sign-up. Do not block Start Building on auth.
    if (!user) {
      router.push('/onboarding/sign-up');
      return;
    }

    setSaving(true);
    const result = await persistStashedOnboardingSelections();
    setSaving(false);

    if (result.error === ONBOARDING_SAVE_ERRORS.unauthenticated) {
      router.push('/onboarding/sign-up');
      return;
    }

    if (result.error) {
      Alert.alert('Could not save workshop', result.error || ONBOARDING_SAVE_ERRORS.generic);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <ReadyScreen
      experienceLabel={summary.experienceLabel}
      componentCount={summary.componentCount}
      interestSummary={summary.interestSummary}
      projects={recommendedProjects}
      onBack={() => router.back()}
      onFinish={() => {
        void handleFinish();
      }}
      saving={saving}
    />
  );
}
