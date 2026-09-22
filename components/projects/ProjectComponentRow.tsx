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
    quantity: number;
    illustrationId: ComponentIllustrationId;
  };
};

export function ProjectComponentRow({ component }: ProjectComponentRowProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <ComponentIllustration id={component.illustrationId} name={component.name} size={40} plate />
      </View>
      <Text style={styles.name}>{component.name}</Text>
      <Text style={styles.quantity}>×{component.quantity}</Text>
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
    name: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    quantity: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
    },
  });
}
