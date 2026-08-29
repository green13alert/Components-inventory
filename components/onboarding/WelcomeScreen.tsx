import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { PcbBackground } from '@/components/onboarding/PcbBackground';
import { SolderiColors } from '@/constants/colors';
import { ONBOARDING_WELCOME } from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type WelcomeScreenProps = {
  onContinue: () => void;
  onLogIn: () => void;
  /** TEMP dev skip control — omit in production */
  skipControl?: ReactNode;
};

export function WelcomeScreen({ onContinue, onLogIn, skipControl }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <PcbBackground />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing['3xl'],
            paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.sm,
          },
        ]}>
        {skipControl}

        <View style={styles.spacer} />

        <Animated.View entering={FadeInDown.duration(480)} style={styles.copy}>
          <Text style={styles.heading}>{ONBOARDING_WELCOME.heading}</Text>
          <Text style={styles.tagline}>{ONBOARDING_WELCOME.tagline}</Text>
          <Text style={styles.description}>{ONBOARDING_WELCOME.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(480).delay(90)} style={styles.ctaWrap}>
          <OnboardingCta label={ONBOARDING_WELCOME.cta} onPress={onContinue} />
          <Pressable
            onPress={onLogIn}
            style={styles.loginRow}
            accessibilityRole="button"
            accessibilityLabel="Already have an account? Log in">
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </Animated.View>
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
  spacer: {
    flex: 1,
  },
  copy: {
    maxWidth: 320,
    gap: 10,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 38,
    color: SolderiColors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: -0.3,
    lineHeight: 24,
    color: SolderiColors.accent,
  },
  description: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: SolderiColors.textSecondary,
  },
  ctaWrap: {
    marginTop: Spacing['3xl'],
    gap: Spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  loginPrompt: {
    fontSize: 15,
    color: SolderiColors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.accent,
  },
});
