import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import {
  componentRowPresentation,
  type ComponentRowCoverage,
} from '@/components/projects/component-row-state';
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
    coverage?: ComponentRowCoverage;
    substituteName?: string | null;
  };
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const presentation = componentRowPresentation({
    coverage: component.coverage,
    isOwned: component.isOwned,
    substituteName: component.substituteName,
  });
  const satisfied = presentation.status !== 'missing';
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, !satisfied && styles.iconWrapMissing]}>
        <ComponentIllustration
          id={component.illustrationId}
          name={component.name}
          size={40}
          plate={presentation.status === 'owned'}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.name, !satisfied && styles.nameMissing]}>{component.name}</Text>
        <Text style={styles.quantityDetail}>Required: {component.requiredQuantity}</Text>
        <Text style={styles.quantityDetail}>You have: {component.ownedQuantity}</Text>
        {presentation.substituteLine ? (
          <Text style={styles.quantityDetail}>{presentation.substituteLine}</Text>
        ) : null}
        {presentation.status === 'missing' ? (
          <Text style={styles.quantityDetail}>Missing: {component.missingQuantity}</Text>
        ) : null}
      </View>
      <View style={[styles.badge, satisfied ? styles.badgeOwned : styles.badgeMissing]}>
        <Ionicons
          name={satisfied ? 'checkmark' : 'close'}
          size={12}
          color={satisfied ? colors.success : colors.warning}
        />
        <Text style={[styles.badgeText, satisfied ? styles.badgeTextOwned : styles.badgeTextMissing]}>
          {presentation.badge}
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
