import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { SignUpScreen } from '@/components/auth/SignUpScreen';
import { AUTH_ERRORS, AUTH_SOCIAL_UNAVAILABLE } from '@/constants/auth';
import { useAuth } from '@/context/auth-context';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpRoute() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showSocialUnavailable = () => {
    Alert.alert(AUTH_SOCIAL_UNAVAILABLE.title, AUTH_SOCIAL_UNAVAILABLE.message);
  };

  const handleCreateAccount = async () => {
    if (submitting) {
      return;
    }

    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail
      ? AUTH_ERRORS.emailRequired
      : EMAIL_PATTERN.test(trimmedEmail)
        ? undefined
        : AUTH_ERRORS.emailInvalid;
    const nextPasswordError = !password
      ? AUTH_ERRORS.passwordRequired
      : password.length < 6
        ? AUTH_ERRORS.passwordTooShort
        : undefined;
    const nextConfirmError = !confirmPassword
      ? AUTH_ERRORS.confirmRequired
      : password !== confirmPassword
        ? AUTH_ERRORS.passwordMismatch
        : undefined;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmError);
    setFormError(null);

    if (nextEmailError || nextPasswordError || nextConfirmError) {
      return;
    }

    setSubmitting(true);
    const result = await signUpWithEmail(trimmedEmail, password);
    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      router.push({
        pathname: '/onboarding/verify-email',
        params: { email: trimmedEmail },
      });
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <SignUpScreen
      email={email}
      password={password}
      confirmPassword={confirmPassword}
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
      onConfirmPasswordChange={(value) => {
        setConfirmPassword(value);
        setConfirmPasswordError(undefined);
        setFormError(null);
      }}
      onCreateAccount={() => {
        void handleCreateAccount();
      }}
      onLogIn={() => router.push('/onboarding/login')}
      onBack={() => router.back()}
      onSocialApple={showSocialUnavailable}
      onSocialGoogle={showSocialUnavailable}
      emailError={emailError}
      passwordError={passwordError}
      confirmPasswordError={confirmPasswordError}
      formError={formError}
      submitting={submitting}
    />
  );
}
