import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import { ProjectComponent } from '@/constants/projects-data';
import { useSolderiColors } from '@/context/theme-context';

type ProjectComponentRowProps = {
  component: ProjectComponent;
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      <Text style={styles.quantity}>×{component.quantity}</Text>
      <View style={[styles.badge, component.owned ? styles.badgeOwned : styles.badgeMissing]}>
        <Ionicons
          name={component.owned ? 'checkmark' : 'close'}
          size={12}
          color={component.owned ? colors.success : colors.warning}
        />
        <Text style={[styles.badgeText, component.owned ? styles.badgeTextOwned : styles.badgeTextMissing]}>
          {component.owned ? 'Owned' : 'Missing'}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textPrimary,
    },
    nameMissing: {
      color: colors.textSecondary,
    },
    quantity: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
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
      backgroundColor: colors.successMuted,
    },
    badgeMissing: {
      backgroundColor: colors.accentMuted,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
    },
    badgeTextOwned: {
      color: colors.success,
    },
    badgeTextMissing: {
      color: colors.warning,
    },
  });
}
