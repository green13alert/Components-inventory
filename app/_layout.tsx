import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AtlasProvider } from '@/context/atlas-context';
import { SolderiThemeProvider, useSolderiTheme } from '@/context/theme-context';
import { getNavigationTheme } from '@/constants/theme';
import { testSupabaseConnection } from '@/lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedRoot() {
  const { colors, resolvedScheme } = useSolderiTheme();
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
            <Stack.Screen
              name="(tabs)"
              options={{
                freezeOnBlur: false,
              }}
            />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings/notifications" />
            <Stack.Screen name="ai" />
            <Stack.Screen name="project/[id]" />
            <Stack.Screen name="project/build/[id]" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
      <ThemedRoot />
    </SolderiThemeProvider>
  );
}
