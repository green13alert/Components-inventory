import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Radii } from '@/constants/tokens';

type SegmentOption = {
  id: string;
  label: string;
};

type SettingsSegmentedRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  options: readonly SegmentOption[];
  value: string;
  onChange: (id: string) => void;
  grouped?: boolean;
};

export function SettingsSegmentedRow({
  icon,
  label,
  options,
  value,
  onChange,
  grouped,
}: SettingsSegmentedRowProps) {
  return (
    <View style={[styles.row, grouped && styles.rowGrouped]}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={SolderiColors.textSecondary} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View
        style={styles.segments}
        accessibilityRole="tablist"
        accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.segment,
                selected && styles.segmentSelected,
                pressed && styles.segmentPressed,
              ]}
              onPress={() => onChange(option.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}>
              <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  rowGrouped: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: SolderiColors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: SolderiColors.textPrimary,
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: SolderiColors.surfaceElevated,
    borderRadius: Radii.md,
    padding: 3,
    gap: 2,
    marginLeft: 48,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.sm,
  },
  segmentSelected: {
    backgroundColor: SolderiColors.accentMuted,
  },
  segmentPressed: {
    opacity: 0.8,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SolderiColors.textSecondary,
  },
  segmentLabelSelected: {
    color: SolderiColors.accent,
  },
});
