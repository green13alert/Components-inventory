import { Ionicons } from '@expo/vector-icons';
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
import type { SolderiPalette } from '@/constants/colors';
import { AUTH_SIGN_UP } from '@/constants/auth';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type SignUpScreenProps = {
  email: string;
  password: string;
  confirmPassword: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onCreateAccount: () => void;
  onLogIn: () => void;
  onBack: () => void;
  onSocialApple?: () => void;
  onSocialGoogle?: () => void;
};

function SocialAuthButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={icon} size={20} color={colors.textPrimary} />
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

export function SignUpScreen({
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onCreateAccount,
  onLogIn,
  onBack,
  onSocialApple,
  onSocialGoogle,
}: SignUpScreenProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.background, colors.background]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing.sm,
              paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.md,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>{AUTH_SIGN_UP.title}</Text>
            <Text style={styles.subtitle}>{AUTH_SIGN_UP.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              compact
              label={AUTH_SIGN_UP.emailLabel}
              placeholder={AUTH_SIGN_UP.emailPlaceholder}
              value={email}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              returnKeyType="next"
            />
            <AuthTextField
              compact
              label={AUTH_SIGN_UP.passwordLabel}
              placeholder={AUTH_SIGN_UP.passwordPlaceholder}
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="next"
            />
            <AuthTextField
              compact
              label={AUTH_SIGN_UP.confirmPasswordLabel}
              placeholder={AUTH_SIGN_UP.confirmPasswordPlaceholder}
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              returnKeyType="done"
            />
          </View>

          <View style={styles.actions}>
            <OnboardingCta label={AUTH_SIGN_UP.createAccount} onPress={onCreateAccount} />

            <Pressable
              onPress={onLogIn}
              style={styles.loginRow}
              accessibilityRole="button"
              accessibilityLabel={`${AUTH_SIGN_UP.loginPrompt} ${AUTH_SIGN_UP.loginLink}`}>
              <Text style={styles.loginPrompt}>{AUTH_SIGN_UP.loginPrompt} </Text>
              <Text style={styles.loginLink}>{AUTH_SIGN_UP.loginLink}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{AUTH_SIGN_UP.orDivider}</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialStack}>
              <SocialAuthButton
                label={AUTH_SIGN_UP.continueApple}
                icon="logo-apple"
                onPress={onSocialApple}
              />
              <SocialAuthButton
                label={AUTH_SIGN_UP.continueGoogle}
                icon="logo-google"
                onPress={onSocialGoogle}
              />
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
      gap: Spacing.lg,
    },
    backButton: {
      alignSelf: 'flex-start',
      width: 40,
      height: 40,
      marginLeft: -8,
      marginBottom: -Spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    header: {
      gap: Spacing.sm,
    },
    title: {
      fontSize: 23,
      fontWeight: '700',
      letterSpacing: -0.45,
      lineHeight: 28,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      maxWidth: 320,
    },
    form: {
      gap: Spacing.md,
    },
    actions: {
      gap: Spacing.lg,
    },
    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    loginPrompt: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    loginLink: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'lowercase',
    },
    socialStack: {
      gap: Spacing.sm,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      minHeight: 52,
      borderRadius: Radii.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    socialButtonPressed: {
      opacity: 0.88,
      backgroundColor: colors.surfaceElevated,
    },
    socialLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
  });
}
