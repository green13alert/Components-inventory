import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import type { ComponentIllustrationId } from '@/constants/component-illustrations';
import { useSolderiColors } from '@/context/theme-context';

type ProjectComponentRowProps = {
  component: {
    id: string;
    name: string;
    illustrationId: ComponentIllustrationId;
    requiredQuantity: number;
    ownedQuantity: number;
    missingQuantity: number;
    isOwned: boolean;
  };
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, !component.isOwned && styles.iconWrapMissing]}>
        <ComponentIllustration
          id={component.illustrationId}
          name={component.name}
          size={40}
          plate={component.isOwned}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.name, !component.isOwned && styles.nameMissing]}>{component.name}</Text>
        <Text style={styles.quantityDetail}>Required: {component.requiredQuantity}</Text>
        <Text style={styles.quantityDetail}>You have: {component.ownedQuantity}</Text>
        {component.isOwned ? null : (
          <Text style={styles.quantityDetail}>Missing: {component.missingQuantity}</Text>
        )}
      </View>
      <View style={[styles.badge, component.isOwned ? styles.badgeOwned : styles.badgeMissing]}>
        <Ionicons
          name={component.isOwned ? 'checkmark' : 'close'}
          size={12}
          color={component.isOwned ? colors.success : colors.warning}
        />
        <Text style={[styles.badgeText, component.isOwned ? styles.badgeTextOwned : styles.badgeTextMissing]}>
          {component.isOwned ? 'Owned' : 'Missing'}
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
    copy: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    nameMissing: {
      color: colors.textSecondary,
    },
    quantityDetail: {
      fontSize: 12,
      lineHeight: 16,
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
