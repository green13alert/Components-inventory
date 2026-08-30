import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { PcbBackground } from '@/components/onboarding/PcbBackground';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type OnboardingShellProps = {
  step: number;
  title: string;
  description: string;
  onBack: () => void;
  footer: ReactNode;
  children: ReactNode;
  background?: 'gradient' | 'pcb-top' | 'pcb-subtle';
  backgroundOverlay?: ReactNode;
  scrollable?: boolean;
  headerGap?: number;
};

export function OnboardingShell({
  step,
  title,
  description,
  onBack,
  footer,
  children,
  background = 'gradient',
  backgroundOverlay,
  scrollable = true,
  headerGap,
}: OnboardingShellProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const bg = colors.background;

  const content = (
    <>
      <View style={[styles.headerCopy, headerGap != null && { marginBottom: headerGap }]}>
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
          colors={[colors.gradientStart, colors.background, colors.background]}
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
                ? [`${bg}66`, `${bg}CC`, `${bg}F5`, bg]
                : [`${bg}88`, `${bg}D9`, `${bg}F2`]
            }
            locations={background === 'pcb-top' ? [0, 0.22, 0.48, 1] : [0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : null}

      {backgroundOverlay ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {backgroundOverlay}
        </View>
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
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
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

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.textPrimary,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      maxWidth: 320,
    },
    footer: {
      paddingTop: Spacing.lg,
    },
  });
}
