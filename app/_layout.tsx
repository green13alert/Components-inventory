import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AtlasProvider } from '@/context/atlas-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AtlasDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0D0F14',
    card: '#171B24',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#20B8C4',
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AtlasProvider>
        <ThemeProvider value={AtlasDarkTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="ai" options={{ headerShown: false }} />
            <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="project/build/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AtlasProvider>
    </GestureHandlerRootView>
  );
}
