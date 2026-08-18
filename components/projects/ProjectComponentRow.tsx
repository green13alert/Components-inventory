import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { SolderiColors } from '@/constants/colors';
import { ProjectComponent } from '@/constants/projects-data';

type ProjectComponentRowProps = {
  component: ProjectComponent;
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, !component.owned && styles.iconWrapMissing]}>
        <ComponentIllustration
          id={component.illustrationId}
          name={component.name}
          size={40}
          plate={component.owned}
        />
      </View>
      <Text style={[styles.name, !component.owned && styles.nameMissing]}>{component.name}</Text>
      <View style={[styles.badge, component.owned ? styles.badgeOwned : styles.badgeMissing]}>
        <Ionicons
          name={component.owned ? 'checkmark' : 'close'}
          size={12}
          color={component.owned ? SolderiColors.success : SolderiColors.warning}
        />
        <Text style={[styles.badgeText, component.owned ? styles.badgeTextOwned : styles.badgeTextMissing]}>
          {component.owned ? 'Owned' : 'Missing'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapMissing: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    opacity: 0.75,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
  },
  nameMissing: {
    color: SolderiColors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeOwned: {
    backgroundColor: SolderiColors.successMuted,
  },
  badgeMissing: {
    backgroundColor: SolderiColors.accentMuted,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextOwned: {
    color: SolderiColors.success,
  },
  badgeTextMissing: {
    color: SolderiColors.warning,
  },
});
