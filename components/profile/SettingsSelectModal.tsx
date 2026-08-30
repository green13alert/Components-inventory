import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

export type SettingsSelectOption = {
  id: string;
  label: string;
};

type SettingsSelectModalProps = {
  visible: boolean;
  title: string;
  options: readonly SettingsSelectOption[];
  value: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function SettingsSelectModal({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: SettingsSelectModalProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.list}>
            {options.map((option, index) => {
              const selected = option.id === value;
              return (
                <View key={option.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                    onPress={() => {
                      onSelect(option.id);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={option.label}>
                    <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderRadius: Radii.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
      overflow: 'hidden',
    },
    title: {
      ...Typography.cardTitle,
      color: colors.textPrimary,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    list: {
      backgroundColor: colors.surface,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 52,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.md,
    },
    optionPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    optionLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    optionLabelSelected: {
      color: colors.accent,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: Spacing.lg,
    },
  });
}
