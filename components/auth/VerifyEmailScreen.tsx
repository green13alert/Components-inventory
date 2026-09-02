import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/auth/AuthTextField';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { AUTH_VERIFY_EMAIL } from '@/constants/auth';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type VerifyEmailScreenProps = {
  email: string;
  code: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack?: () => void;
  codeError?: string;
  formError?: string | null;
  submitting?: boolean;
  resending?: boolean;
  cooldownSeconds: number;
};

export function VerifyEmailScreen({
  email,
  code,
  onCodeChange,
  onVerify,
  onResend,
  onBack,
  codeError,
  formError,
  submitting = false,
  resending = false,
  cooldownSeconds,
}: VerifyEmailScreenProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const canVerify = code.length === 6 && !submitting;
  const canResend = cooldownSeconds <= 0 && !resending && !submitting;
  const resendLabel =
    cooldownSeconds > 0 ? `${AUTH_VERIFY_EMAIL.resend} in ${cooldownSeconds}s` : AUTH_VERIFY_EMAIL.resend;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing.lg,
              paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md,
            },
          ]}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.title}>{AUTH_VERIFY_EMAIL.title}</Text>
            <Text style={styles.subtitle}>
              {AUTH_VERIFY_EMAIL.subtitle}
              {email ? ` ${email}` : '.'}
            </Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              label={AUTH_VERIFY_EMAIL.codeLabel}
              placeholder={AUTH_VERIFY_EMAIL.codePlaceholder}
              value={code}
              onChangeText={onCodeChange}
              error={codeError}
              disabled={submitting}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (canVerify) {
                  onVerify();
                }
              }}
            />
          </View>

          <View style={styles.actions}>
            {formError ? <Text style={styles.formError}>{formError}</Text> : null}
            <OnboardingCta
              label={AUTH_VERIFY_EMAIL.verify}
              onPress={onVerify}
              disabled={!canVerify}
              loading={submitting}
            />

            <View style={styles.resendBlock}>
              <Text style={styles.resendPrompt}>{AUTH_VERIFY_EMAIL.resendPrompt}</Text>
              <Pressable
                onPress={onResend}
                disabled={!canResend}
                accessibilityRole="button"
                accessibilityLabel={resendLabel}
                accessibilityState={{ disabled: !canResend }}>
                <Text style={[styles.resendAction, !canResend && styles.resendActionDisabled]}>
                  {resendLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    form: {
      gap: Spacing.lg,
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
      alignItems: 'center',
      gap: Spacing.sm,
    },
    resendPrompt: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    resendAction: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
    },
    resendActionDisabled: {
      color: colors.textMuted,
    },
  });
}
