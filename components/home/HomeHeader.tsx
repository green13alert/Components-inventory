import { StyleSheet, Text, View } from 'react-native';

import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { SolderiColors } from '@/constants/colors';
import { Spacing, Typography } from '@/constants/tokens';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

type HomeHeaderProps = {
  name?: string;
};

export function HomeHeader({ name = 'Maker' }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
      <ProfileAvatar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    ...Typography.greeting,
    color: SolderiColors.textSecondary,
  },
  name: {
    ...Typography.heading,
    color: SolderiColors.textPrimary,
  },
});
