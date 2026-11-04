import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { EXPERIENCE_LABELS, INTEREST_OPTIONS, type ExperienceLevel } from '@/constants/onboarding';
import { getOnboardingChoice, ONBOARDING_OFFERS } from '@/constants/onboarding-offers';
import {
  applySheetQuantities,
  parseOnboardingQuantity,
  type OnboardingComponentSelection,
  type OnboardingSheetQuantity,
} from '@/lib/onboarding-inventory';

type OnboardingContextValue = {
  experience: ExperienceLevel | null;
  setExperience: (level: ExperienceLevel) => void;
  selectedComponents: OnboardingComponentSelection[];
  setComponentQuantity: (slug: string, quantity: number) => void;
  applyOfferQuantities: (draft: readonly OnboardingSheetQuantity[]) => void;
  removeComponent: (slug: string) => void;
  selectedInterestIds: string[];
  toggleInterest: (id: string) => void;
  summary: {
    experienceLabel: string | null;
    componentCount: number;
    pieceCount: number;
    componentSummary: string;
    interestLabels: string[];
    interestSummary: string;
  };
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<OnboardingComponentSelection[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);

  const setComponentQuantity = (slug: string, quantity: number) => {
    const parsed = parseOnboardingQuantity(quantity);
    const choice = getOnboardingChoice(slug);
    if (parsed == null || !choice || choice.slug !== slug) {
      return;
    }
    setSelectedComponents((current) => {
      const next = current.filter((item) => item.slug !== slug);
      next.push({ slug, quantity: parsed });
      return next;
    });
  };

  const applyOfferQuantities = (draft: readonly OnboardingSheetQuantity[]) => {
    setSelectedComponents((current) => applySheetQuantities(current, draft) ?? current);
  };

  const removeComponent = (slug: string) => {
    setSelectedComponents((current) => current.filter((item) => item.slug !== slug));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterestIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const value = useMemo<OnboardingContextValue>(() => {
    const interestLabels = selectedInterestIds
      .map((id) => INTEREST_OPTIONS.find((option) => option.id === id)?.label)
      .filter(Boolean) as string[];

    const componentCount = selectedComponents.length;
    const pieceCount = selectedComponents.reduce((sum, item) => sum + item.quantity, 0);
    const componentSummary =
      selectedComponents.length === 0
        ? '0 components'
        : selectedComponents
            .map((item) => {
              const name = getOnboardingChoice(item.slug)?.name ?? item.slug;
              return `${name} ×${item.quantity}`;
            })
            .join('\n');

    return {
      experience,
      setExperience,
      selectedComponents,
      setComponentQuantity,
      applyOfferQuantities,
      removeComponent,
      selectedInterestIds,
      toggleInterest,
      summary: {
        experienceLabel: experience ? EXPERIENCE_LABELS[experience] : null,
        componentCount,
        pieceCount,
        componentSummary,
        interestLabels,
        interestSummary: interestLabels.slice(0, 3).join(' · '),
      },
    };
  }, [experience, selectedComponents, selectedInterestIds]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

export function getComponentsByCategory() {
  return ONBOARDING_OFFERS;
}
