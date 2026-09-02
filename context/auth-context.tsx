import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { AUTH_ERRORS } from '@/constants/auth';
import { supabase } from '@/lib/supabase';

type SignUpResult = {
  error: string | null;
  needsEmailConfirmation: boolean;
};

type AuthActionResult = {
  error: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isReady: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<SignUpResult>;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  verifyEmailOtp: (email: string, token: string) => Promise<AuthActionResult>;
  resendEmailOtp: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(message: string | undefined): string {
  if (!message) {
    return AUTH_ERRORS.generic;
  }

  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return AUTH_ERRORS.invalidCredentials;
  }
  if (lower.includes('email not confirmed')) {
    return AUTH_ERRORS.emailNotConfirmed;
  }
  if (lower.includes('user already registered')) {
    return AUTH_ERRORS.alreadyRegistered;
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return AUTH_ERRORS.network;
  }

  return message;
}

function mapOtpError(message: string | undefined): string {
  if (!message) {
    return AUTH_ERRORS.otpInvalid;
  }

  const lower = message.toLowerCase();

  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return AUTH_ERRORS.network;
  }

  return AUTH_ERRORS.otpInvalid;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) {
          setSession(data.session);
          setIsReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setIsReady(true);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) {
        setSession(nextSession);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { error: mapAuthError(error.message), needsEmailConfirmation: false };
    }

    if (data.user?.identities && data.user.identities.length === 0) {
      return { error: AUTH_ERRORS.alreadyRegistered, needsEmailConfirmation: false };
    }

    if (!data.session) {
      return { error: null, needsEmailConfirmation: true };
    }

    return { error: null, needsEmailConfirmation: false };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    return { error: null };
  }, []);

  // OTP delivery uses the project's Auth mailer (built-in now; custom SMTP later is dashboard config).
  const verifyEmailOtp = useCallback(async (email: string, token: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { error: mapOtpError(error.message) };
    }

    return { error: null };
  }, []);

  const resendEmailOtp = useCallback(async (email: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return { error: mapAuthError(error.message) === AUTH_ERRORS.network ? AUTH_ERRORS.network : AUTH_ERRORS.resendFailed };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    return { error: null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isReady,
      signUpWithEmail,
      signInWithEmail,
      verifyEmailOtp,
      resendEmailOtp,
      signOut,
    }),
    [session, isReady, signUpWithEmail, signInWithEmail, verifyEmailOtp, resendEmailOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
