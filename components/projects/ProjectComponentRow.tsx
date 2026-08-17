import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ArduinoColors } from '@/constants/colors';
import { ProjectComponent } from '@/constants/projects-data';

type ProjectComponentRowProps = {
  component: ProjectComponent;
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, !component.owned && styles.iconWrapMissing]}>
        <Ionicons
          name={component.icon}
          size={20}
          color={component.owned ? ArduinoColors.blue : ArduinoColors.textMuted}
        />
      </View>
      <Text style={[styles.name, !component.owned && styles.nameMissing]}>{component.name}</Text>
      <View style={[styles.badge, component.owned ? styles.badgeOwned : styles.badgeMissing]}>
        <Ionicons
          name={component.owned ? 'checkmark' : 'close'}
          size={12}
          color={component.owned ? ArduinoColors.success : ArduinoColors.warning}
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
    backgroundColor: ArduinoColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ArduinoColors.blueMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapMissing: {
    backgroundColor: ArduinoColors.surfaceElevated,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
  },
  nameMissing: {
    color: ArduinoColors.textSecondary,
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
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  badgeMissing: {
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextOwned: {
    color: ArduinoColors.success,
  },
  badgeTextMissing: {
    color: ArduinoColors.warning,
  },
});
