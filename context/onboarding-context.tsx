import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  COMPONENT_CATEGORY_LABELS,
  EXPERIENCE_LABELS,
  INTEREST_OPTIONS,
  MOCK_RECOMMENDED_PROJECTS,
  ONBOARDING_COMPONENTS,
  type ComponentCategory,
  type ExperienceLevel,
  type MockRecommendedProject,
} from '@/constants/onboarding';

type OnboardingContextValue = {
  experience: ExperienceLevel | null;
  setExperience: (level: ExperienceLevel) => void;
  selectedComponentIds: string[];
  toggleComponent: (id: string) => void;
  selectedInterestIds: string[];
  toggleInterest: (id: string) => void;
  summary: {
    experienceLabel: string | null;
    componentCount: number;
    interestLabels: string[];
    interestSummary: string;
  };
  recommendedProjects: MockRecommendedProject[];
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);

  const toggleComponent = (id: string) => {
    setSelectedComponentIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
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

    const componentCount = selectedComponentIds.length;

    const recommendedProjects = MOCK_RECOMMENDED_PROJECTS.map((project, index) => ({
      ...project,
      matched: Math.min(
        project.total,
        componentCount > 0 ? Math.max(1, componentCount - index) : project.matched,
      ),
    }));

    return {
      experience,
      setExperience,
      selectedComponentIds,
      toggleComponent,
      selectedInterestIds,
      toggleInterest,
      summary: {
        experienceLabel: experience ? EXPERIENCE_LABELS[experience] : null,
        componentCount,
        interestLabels,
        interestSummary: interestLabels.slice(0, 3).join(' · '),
      },
      recommendedProjects,
    };
  }, [experience, selectedComponentIds, selectedInterestIds]);

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
  return (Object.keys(COMPONENT_CATEGORY_LABELS) as ComponentCategory[]).map((category) => ({
    category,
    items: ONBOARDING_COMPONENTS.filter((component) => component.category === category),
  }));
}
