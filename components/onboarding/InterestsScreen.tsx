import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InterestCard } from '@/components/onboarding/interests/InterestCard';
import { InterestsHeroAnimation } from '@/components/onboarding/interests/InterestsHeroAnimation';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { SolderiColors } from '@/constants/colors';
import { INTEREST_OPTIONS, ONBOARDING_CONTINUE } from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type InterestsScreenProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

const HORIZONTAL_INSET = 28;
const HERO_ASPECT = 200 / 360;

export function InterestsScreen({
  selectedIds,
  onToggle,
  onBack,
  onContinue,
}: InterestsScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const contentWidth = screenWidth - HORIZONTAL_INSET * 2;
  const heroHeight = Math.min(200, Math.round(contentWidth * HERO_ASPECT));

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1E2226', '#181B1E', '#181B1E']}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: 88 + Math.max(insets.bottom, Spacing.lg),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={SolderiColors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={4} />
          </View>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.headerBlock}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>What do you want to build?</Text>
            <Text style={styles.description}>Choose the areas you're interested in.</Text>
          </View>

          <InterestsHeroAnimation width={contentWidth} height={heroHeight} selectedIds={selectedIds} />
        </View>

        <View style={styles.cardGrid}>
          {INTEREST_OPTIONS.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              selected={selectedIds.includes(interest.id)}
              onPress={() => onToggle(interest.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <OnboardingCta
          label={ONBOARDING_CONTINUE}
          onPress={onContinue}
          disabled={selectedIds.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SolderiColors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_INSET,
    gap: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 40,
  },
  progressWrap: {
    flex: 1,
  },
  headerBlock: {
    gap: Spacing.md,
  },
  headerCopy: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 34,
    color: SolderiColors.textPrimary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: SolderiColors.textSecondary,
    maxWidth: 320,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  footer: {
    paddingHorizontal: HORIZONTAL_INSET,
    paddingTop: Spacing.sm,
    backgroundColor: SolderiColors.background,
  },
});
