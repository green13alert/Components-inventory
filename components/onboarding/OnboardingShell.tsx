import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { PcbBackground } from '@/components/onboarding/PcbBackground';
import { SolderiColors } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';

type OnboardingShellProps = {
  step: number;
  title: string;
  description: string;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
  background?: 'gradient' | 'pcb-top' | 'pcb-subtle';
  scrollable?: boolean;
};

export function OnboardingShell({
  step,
  title,
  description,
  onBack,
  footer,
  children,
  background = 'gradient',
  scrollable = true,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </>
  );

  return (
    <View style={styles.screen}>
      {background === 'gradient' ? (
        <LinearGradient
          colors={['#1E2226', '#181B1E', '#181B1E']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {background === 'pcb-top' || background === 'pcb-subtle' ? (
        <>
          <PcbBackground />
          <LinearGradient
            colors={
              background === 'pcb-top'
                ? ['#181B1E66', '#181B1ECC', '#181B1EF5', '#181B1E']
                : ['#181B1E88', '#181B1ED9', '#181B1EF2']
            }
            locations={background === 'pcb-top' ? [0, 0.22, 0.48, 1] : [0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.sm,
            paddingBottom: Math.max(insets.bottom, Spacing.lg),
          },
        ]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={SolderiColors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={step} />
          </View>
          <View style={styles.backSpacer} />
        </View>

        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {content}
          </ScrollView>
        ) : (
          <View style={styles.body}>{content}</View>
        )}

        <View style={styles.footer}>{footer}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SolderiColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  body: {
    flex: 1,
  },
  headerCopy: {
    gap: 8,
    marginBottom: Spacing['2xl'],
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
  footer: {
    paddingTop: Spacing.lg,
  },
});
