import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { VerifyEmailScreen } from '@/components/auth/VerifyEmailScreen';
import { AUTH_ERRORS } from '@/constants/auth';
import { useAuth } from '@/context/auth-context';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export default function VerifyEmailRoute() {
  const router = useRouter();
  const { verifyEmailOtp, resendEmailOtp } = useAuth();
  const { email: emailParam } = useLocalSearchParams<{ email?: string | string[] }>();
  const email = Array.isArray(emailParam) ? (emailParam[0] ?? '') : (emailParam ?? '');

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  const handleVerify = async () => {
    if (submitting) {
      return;
    }

    if (!email) {
      setFormError(AUTH_ERRORS.emailRequired);
      return;
    }

    if (code.length !== OTP_LENGTH) {
      setCodeError(AUTH_ERRORS.otpRequired);
      return;
    }

    setCodeError(undefined);
    setFormError(null);
    setSubmitting(true);
    const result = await verifyEmailOtp(email, code);
    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    router.replace('/(tabs)');
  };

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
    const result = await resendEmailOtp(email);
    setResending(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <VerifyEmailScreen
      email={email}
      code={code}
      onCodeChange={(value) => {
        setCode(digitsOnly(value));
        setCodeError(undefined);
        setFormError(null);
      }}
      onVerify={() => {
        void handleVerify();
      }}
      onResend={() => {
        void handleResend();
      }}
      onBack={() => router.back()}
      codeError={codeError}
      formError={formError}
      submitting={submitting}
      resending={resending}
      cooldownSeconds={cooldownSeconds}
    />
  );
}
