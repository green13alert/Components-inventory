import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { LoginScreen } from '@/components/auth/LoginScreen';
import { AUTH_ERRORS } from '@/constants/auth';
import { useAuth } from '@/context/auth-context';
import { persistStashedOnboardingSelections } from '@/lib/onboarding-persistence';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginRoute() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogIn = async () => {
    if (submitting) {
      return;
    }

    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail
      ? AUTH_ERRORS.emailRequired
      : EMAIL_PATTERN.test(trimmedEmail)
        ? undefined
        : AUTH_ERRORS.emailInvalid;
    const nextPasswordError = password ? undefined : AUTH_ERRORS.passwordRequired;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    setSubmitting(true);
    const result = await signInWithEmail(trimmedEmail, password);

    if (result.error) {
      setSubmitting(false);
      setFormError(result.error);
      return;
    }

    const persistResult = await persistStashedOnboardingSelections();
    setSubmitting(false);
    if (persistResult.error) {
      setFormError(persistResult.error);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <LoginScreen
      email={email}
      password={password}
      onEmailChange={(value) => {
        setEmail(value);
        setEmailError(undefined);
        setFormError(null);
      }}
      onPasswordChange={(value) => {
        setPassword(value);
        setPasswordError(undefined);
        setFormError(null);
      }}
      onLogIn={() => {
        void handleLogIn();
      }}
      onSignUp={() => router.replace('/onboarding/sign-up')}
      onBack={() => router.back()}
      showSignUpLink={from !== 'welcome'}
      emailError={emailError}
      passwordError={passwordError}
      formError={formError}
      submitting={submitting}
    />
  );
}
