import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { AUTH_CALLBACK, AUTH_ERRORS } from '@/constants/auth';
import type { SolderiPalette } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';
import { useAuth } from '@/context/auth-context';
import { useSolderiColors } from '@/context/theme-context';
import { processAuthCallbackParams, processAuthCallbackUrl } from '@/lib/auth-callback';

export default function AuthCallbackRoute() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const linkingUrl = Linking.useLinkingURL();
  const routeParams = useLocalSearchParams();
  const paramsKey = JSON.stringify(routeParams);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (linkingUrl) {
        const fromLink = await processAuthCallbackUrl(linkingUrl);
        if (cancelled) {
          return;
        }

        if (fromLink.handled) {
          setError(fromLink.error);
          return;
        }
      }

      const fromParams = await processAuthCallbackParams(
        routeParams as Record<string, string | string[] | undefined>,
      );
      if (cancelled) {
        return;
      }

      if (fromParams.handled) {
        setError(fromParams.error);
        return;
      }

      if (linkingUrl) {
        setError(AUTH_ERRORS.confirmationMissing);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // paramsKey captures route param identity without looping on a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- routeParams is represented by paramsKey
  }, [linkingUrl, paramsKey]);

  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session, router]);

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + Spacing['3xl'], paddingBottom: insets.bottom + Spacing.lg },
      ]}>
      {error ? (
        <>
          <Text style={styles.title}>{AUTH_CALLBACK.errorTitle}</Text>
          <Text style={styles.body}>{error}</Text>
          <OnboardingCta
            label={AUTH_CALLBACK.useCode}
            onPress={() => router.replace('/onboarding/verify-email')}
          />
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.title}>{AUTH_CALLBACK.title}</Text>
          <Text style={styles.body}>{AUTH_CALLBACK.subtitle}</Text>
        </>
      )}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing['2xl'],
      justifyContent: 'center',
      gap: Spacing.lg,
    },
    title: {
      ...Typography.heading,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    body: {
      ...Typography.greeting,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
