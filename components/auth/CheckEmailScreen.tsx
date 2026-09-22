import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { AUTH_CHECK_EMAIL } from '@/constants/auth';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type CheckEmailScreenProps = {
  email: string;
  onResend: () => void;
  onBack?: () => void;
  formError?: string | null;
  resending?: boolean;
  cooldownSeconds: number;
};

export function CheckEmailScreen({
  email,
  onResend,
  onBack,
  formError,
  resending = false,
  cooldownSeconds,
}: CheckEmailScreenProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const canResend = cooldownSeconds <= 0 && !resending;
  const resendLabel =
    cooldownSeconds > 0 ? `${AUTH_CHECK_EMAIL.resend} in ${cooldownSeconds}s` : AUTH_CHECK_EMAIL.resend;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.title}>{AUTH_CHECK_EMAIL.title}</Text>
          <Text style={styles.subtitle}>
            {AUTH_CHECK_EMAIL.subtitle}
            {email ? ` ${email}` : '.'}
          </Text>
        </View>

        <View style={styles.waiting}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.waitingLabel}>{AUTH_CHECK_EMAIL.waiting}</Text>
        </View>

        <View style={styles.actions}>
          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <View style={styles.resendBlock}>
            <Text style={styles.resendPrompt}>{AUTH_CHECK_EMAIL.resendPrompt}</Text>
            <OnboardingCta
              label={resendLabel}
              onPress={onResend}
              disabled={!canResend}
              loading={resending}
              variant="surface"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 28,
      gap: Spacing['2xl'],
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: Spacing.xs,
    },
    backLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    header: {
      gap: Spacing.md,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
      lineHeight: 32,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      maxWidth: 320,
    },
    waiting: {
      alignItems: 'center',
      gap: Spacing.md,
      paddingVertical: Spacing.lg,
    },
    waitingLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    actions: {
      gap: Spacing.lg,
      paddingTop: Spacing.xs,
    },
    formError: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.error,
      textAlign: 'center',
    },
    resendBlock: {
      gap: Spacing.md,
    },
    resendPrompt: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
