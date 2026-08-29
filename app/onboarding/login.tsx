import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { LoginScreen } from '@/components/auth/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LoginScreen
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onLogIn={() => router.replace('/(tabs)')}
      onSignUp={() => router.replace('/onboarding/sign-up')}
      onBack={() => router.back()}
      showSignUpLink={from !== 'welcome'}
    />
  );
}
