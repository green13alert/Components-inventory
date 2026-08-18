/**
 * Copy, assets, and mock data for the onboarding flow.
 * Swap `ONBOARDING_PCB_IMAGE` without changing screen layout.
 */

export const ONBOARDING_PCB_IMAGE = require('../assets/images/onboarding-pcb.jpg');

export const ONBOARDING_WELCOME = {
  heading: 'Welcome to Solderi',
  tagline: 'Build with what you have.',
  description: 'Add your components and discover projects tailored to your inventory.',
  cta: 'Start Building →',
} as const;

export const ONBOARDING_CONTINUE = 'Continue →';

export const ONBOARDING_READY = {
  title: 'Your workshop is ready.',
  description:
    "We've found projects you can build, complete with tutorials, code and everything you need.",
  sectionTitle: 'Projects picked for you',
} as const;

/** Shown on each recommended project card — every project is a full build guide. */
export const PROJECT_BUILD_FEATURES = [
  { emoji: '📖', label: 'Tutorial' },
  { emoji: '💻', label: 'Code' },
  { emoji: '🧩', label: 'Parts' },
] as const;

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner' as const,
    emoji: '🌱',
    title: 'Beginner',
    subtitle: "I'm just getting started",
  },
  {
    id: 'intermediate' as const,
    emoji: '🔧',
    title: 'Intermediate',
    subtitle: "I've built a few projects",
  },
  {
    id: 'advanced' as const,
    emoji: '⚡',
    title: 'Advanced',
    subtitle: "I'm comfortable designing my own projects",
  },
];

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export type ComponentCategory = 'boards' | 'sensors' | 'motors' | 'displays' | 'components';

export const COMPONENT_CATEGORY_LABELS: Record<ComponentCategory, string> = {
  boards: 'Boards',
  sensors: 'Sensors',
  motors: 'Motors',
  displays: 'Displays',
  components: 'Components',
};

export type OnboardingComponent = {
  id: string;
  name: string;
  category: ComponentCategory;
};

export const ONBOARDING_COMPONENTS: OnboardingComponent[] = [
  { id: 'arduino-uno', name: 'Arduino Uno', category: 'boards' },
  { id: 'esp32', name: 'ESP32', category: 'boards' },
  { id: 'servo-sg90', name: 'Servo SG90', category: 'motors' },
  { id: 'hc-sr04', name: 'HC-SR04', category: 'sensors' },
  { id: 'oled', name: 'OLED Display', category: 'displays' },
  { id: 'led', name: 'LED', category: 'components' },
  { id: 'resistor', name: 'Resistor', category: 'components' },
  { id: 'breadboard', name: 'Breadboard', category: 'components' },
  { id: 'dc-motor', name: 'DC Motor', category: 'motors' },
  { id: 'dht11', name: 'DHT11', category: 'sensors' },
];

export type OnboardingInterest = {
  id: string;
  emoji: string;
  label: string;
};

export const INTEREST_OPTIONS: OnboardingInterest[] = [
  { id: 'robotics', emoji: '🤖', label: 'Robotics' },
  { id: 'aerospace', emoji: '🚀', label: 'Aerospace' },
  { id: 'smart-home', emoji: '🏠', label: 'Smart Home' },
  { id: 'mechanical', emoji: '⚙️', label: 'Mechanical' },
  { id: 'electronics', emoji: '💡', label: 'Electronics' },
  { id: 'displays', emoji: '🖥️', label: 'Displays' },
  { id: 'rc', emoji: '🚗', label: 'RC / Vehicles' },
  { id: 'sensors', emoji: '🌡️', label: 'Sensors' },
];

export type MockRecommendedProject = {
  id: string;
  emoji: string;
  title: string;
  difficulty: ExperienceLevel;
  matched: number;
  total: number;
};

export const MOCK_RECOMMENDED_PROJECTS: MockRecommendedProject[] = [
  {
    id: 'obstacle-robot',
    emoji: '🚗',
    title: 'Obstacle Avoiding Robot',
    difficulty: 'intermediate',
    matched: 8,
    total: 9,
  },
  {
    id: 'temp-monitor',
    emoji: '🌡️',
    title: 'Smart Temperature Monitor',
    difficulty: 'beginner',
    matched: 6,
    total: 6,
  },
  {
    id: 'servo-radar',
    emoji: '🤖',
    title: 'Servo Radar',
    difficulty: 'intermediate',
    matched: 7,
    total: 8,
  },
];
