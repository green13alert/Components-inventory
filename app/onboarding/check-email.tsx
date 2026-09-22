import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { CheckEmailScreen } from '@/components/auth/CheckEmailScreen';
import { AUTH_ERRORS } from '@/constants/auth';
import { useAuth } from '@/context/auth-context';

const RESEND_COOLDOWN_SECONDS = 60;

export default function CheckEmailRoute() {
  const router = useRouter();
  const { resendConfirmationEmail } = useAuth();
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(emailParam) ? (emailParam[0] ?? '') : (emailParam ?? '');

  const [formError, setFormError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleResend = async () => {
    if (resending || cooldownSeconds > 0) {
      return;
    }

    if (!email) {
      setFormError(AUTH_ERRORS.emailRequired);
      return;
    }

    setFormError(null);
    setResending(true);
    const result = await resendConfirmationEmail(email);
    setResending(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <CheckEmailScreen
      email={email}
      onResend={() => {
        void handleResend();
      }}
      onBack={() => router.back()}
      formError={formError}
      resending={resending}
      cooldownSeconds={cooldownSeconds}
    />
  );
}
