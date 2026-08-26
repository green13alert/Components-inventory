import { useRouter } from 'expo-router';
import { useState } from 'react';

import { SignUpScreen } from '@/components/auth/SignUpScreen';

export default function SignUpRoute() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SignUpScreen
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onCreateAccount={() => router.replace('/(tabs)')}
      onLogIn={() => router.push('/onboarding/login')}
      onBack={() => router.back()}
      onSocialApple={() => router.replace('/(tabs)')}
      onSocialGoogle={() => router.replace('/(tabs)')}
    />
  );
}
