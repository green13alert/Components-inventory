import { ThemeProvider as NavigationThemeProvider } from 'expo-router/react-navigation';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AtlasProvider } from '@/context/atlas-context';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { SolderiThemeProvider, useSolderiTheme } from '@/context/theme-context';
import { getNavigationTheme } from '@/constants/theme';
import { persistStashedOnboardingSelections } from '@/lib/onboarding-persistence';
import { testSupabaseConnection } from '@/lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedRoot() {
  const { colors, resolvedScheme } = useSolderiTheme();
  const { session, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const navigationTheme = getNavigationTheme(colors, resolvedScheme);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
    if (typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = colors.background;
      document.documentElement.style.colorScheme = resolvedScheme;
      document.body.style.backgroundColor = colors.background;
    }
  }, [colors.background, resolvedScheme]);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    void testSupabaseConnection().then((result) => {
      if (result.ok) {
        console.log(`[Solderi] ${result.message}`);
      } else {
        console.warn(`[Solderi] ${result.message}`);
      }
    });
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    void persistStashedOnboardingSelections();
  }, [session]);

  useEffect(() => {
    if (!isReady || !navigationState?.key || !session) {
      return;
    }

    const inAuthForm =
      segments[1] === 'login' || segments[1] === 'sign-up' || segments[1] === 'verify-email';
    const inAuthCallback = segments[0] === 'auth';
    if (inAuthForm || inAuthCallback) {
      router.replace('/(tabs)');
    }
  }, [isReady, session, segments, router, navigationState?.key]);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AtlasProvider>
        <NavigationThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'default',
            }}>
            <Stack.Protected guard={!!session}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  freezeOnBlur: false,
                }}
              />
              <Stack.Screen name="profile" />
              <Stack.Screen name="settings/notifications" />
              <Stack.Screen name="ai" />
              <Stack.Screen name="project/[id]" />
              <Stack.Screen name="project/build/[id]" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack.Protected>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
          </Stack>
          <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
      </AtlasProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <SolderiThemeProvider>
      <AuthProvider>
        <ThemedRoot />
      </AuthProvider>
    </SolderiThemeProvider>
  );
}
