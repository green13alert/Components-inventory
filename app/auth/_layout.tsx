import { Stack } from 'expo-router';

import { useSolderiColors } from '@/context/theme-context';

export default function AuthLayout() {
  const colors = useSolderiColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
