import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AtlasProvider } from '@/context/atlas-context';
import { NavigationTheme } from '@/constants/theme';

SystemUI.setBackgroundColorAsync(NavigationTheme.background);

export const unstable_settings = {
  anchor: '(tabs)',
};

const AtlasDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: NavigationTheme.background,
    card: NavigationTheme.card,
    border: NavigationTheme.border,
    primary: NavigationTheme.primary,
    text: NavigationTheme.text,
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: NavigationTheme.background }}>
      <AtlasProvider>
        <ThemeProvider value={AtlasDarkTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: NavigationTheme.background },
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
            <Stack.Screen name="ai" />
            <Stack.Screen name="project/[id]" />
            <Stack.Screen name="project/build/[id]" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AtlasProvider>
    </GestureHandlerRootView>
  );
}
