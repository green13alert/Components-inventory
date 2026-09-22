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
import * as Linking from 'expo-linking';
import { AppState, type AppStateStatus } from 'react-native';

import { AUTH_ERRORS } from '@/constants/auth';
import { processAuthCallbackUrl } from '@/lib/auth-callback';
import { getEmailRedirectTo } from '@/lib/auth-redirect';
import {
  clearStashedOnboardingSelections,
  discardStashedOnboardingOnAuth,
  keepStashedOnboardingForNewAccount,
} from '@/lib/onboarding-persistence';
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
  resendConfirmationEmail: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

let pendingSignup: { email: string; password: string } | null = null;

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

async function tryCompletePendingSignup() {
  if (!pendingSignup) {
    return;
  }

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    pendingSignup = null;
    return;
  }

  const { error } = await supabase.auth.signInWithPassword(pendingSignup);
  if (!error) {
    pendingSignup = null;
  }
}

async function consumeAuthUrl(url: string | null) {
  if (url) {
    await processAuthCallbackUrl(url);
  }

  await tryCompletePendingSignup();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) {
        setSession(nextSession);
      }
      if (nextSession) {
        pendingSignup = null;
      }
    });

    const hydrate = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!cancelled) {
          setSession(data.session);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      }

      try {
        await consumeAuthUrl(await Linking.getInitialURL());
      } catch {
        // Link handling is best-effort; session hydration should still complete.
      }

      if (!cancelled) {
        setIsReady(true);
      }
    };

    void hydrate();

    const linking = Linking.addEventListener('url', (event) => {
      void consumeAuthUrl(event.url);
    });

    const onAppStateChange = (state: AppStateStatus) => {
      if (state !== 'active') {
        return;
      }

      void (async () => {
        try {
          await consumeAuthUrl(Linking.getLinkingURL());
        } catch {
          await tryCompletePendingSignup();
        }
      })();
    };

    const appState = AppState.addEventListener('change', onAppStateChange);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      linking.remove();
      appState.remove();
    };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    keepStashedOnboardingForNewAccount();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (error) {
      return { error: mapAuthError(error.message), needsEmailConfirmation: false };
    }

    if (data.user?.identities && data.user.identities.length === 0) {
      return { error: AUTH_ERRORS.alreadyRegistered, needsEmailConfirmation: false };
    }

    if (!data.session) {
      pendingSignup = { email, password };
      return { error: null, needsEmailConfirmation: true };
    }

    pendingSignup = null;
    return { error: null, needsEmailConfirmation: false };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    discardStashedOnboardingOnAuth();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    pendingSignup = null;
    clearStashedOnboardingSelections();
    return { error: null };
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    if (error) {
      return {
        error: mapAuthError(error.message) === AUTH_ERRORS.network ? AUTH_ERRORS.network : AUTH_ERRORS.resendFailed,
      };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    pendingSignup = null;
    clearStashedOnboardingSelections();
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
      resendConfirmationEmail,
      signOut,
    }),
    [session, isReady, signUpWithEmail, signInWithEmail, resendConfirmationEmail, signOut],
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
