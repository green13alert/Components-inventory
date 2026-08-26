import { LinearGradient } from 'expo-linear-gradient';
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
import { SolderiColors } from '@/constants/colors';
import { AUTH_LOGIN } from '@/constants/auth';
import { Spacing } from '@/constants/tokens';

type LoginScreenProps = {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogIn: () => void;
  onSignUp: () => void;
  onBack?: () => void;
};

export function LoginScreen({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogIn,
  onSignUp,
  onBack,
}: LoginScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#1E2226', '#181B1E', '#181B1E']}
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
            <Text style={styles.title}>{AUTH_LOGIN.title}</Text>
            <Text style={styles.subtitle}>{AUTH_LOGIN.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              label={AUTH_LOGIN.emailLabel}
              placeholder={AUTH_LOGIN.emailPlaceholder}
              value={email}
              onChangeText={onEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
            />
            <AuthTextField
              label={AUTH_LOGIN.passwordLabel}
              placeholder={AUTH_LOGIN.passwordPlaceholder}
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
            />
          </View>

          <View style={styles.actions}>
            <OnboardingCta label={AUTH_LOGIN.logIn} onPress={onLogIn} />

            <Pressable
              onPress={onSignUp}
              style={styles.linkRow}
              accessibilityRole="button"
              accessibilityLabel={`${AUTH_LOGIN.signUpPrompt} ${AUTH_LOGIN.signUpLink}`}>
              <Text style={styles.linkPrompt}>{AUTH_LOGIN.signUpPrompt} </Text>
              <Text style={styles.linkAccent}>{AUTH_LOGIN.signUpLink}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SolderiColors.background,
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
    color: SolderiColors.textSecondary,
  },
  header: {
    gap: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 32,
    color: SolderiColors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: SolderiColors.textSecondary,
    maxWidth: 320,
  },
  form: {
    gap: Spacing.lg,
  },
  actions: {
    gap: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  linkPrompt: {
    fontSize: 15,
    color: SolderiColors.textSecondary,
  },
  linkAccent: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.accent,
  },
});
