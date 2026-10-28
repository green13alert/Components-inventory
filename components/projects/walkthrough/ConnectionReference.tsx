import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { pressFeedback } from '@/components/ui/press-feedback';
import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';
import { sameWireIds } from '@/lib/diagram-selection';
import type { ConnectionEntry } from '@/lib/connection-reference';

export function SelectedConnectionCard({
  title,
  detail,
  onClear,
}: {
  title: string;
  detail?: string;
  onClear: () => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Clear connection selection" onPress={onClear} style={pressFeedback(styles.clear)}>
        <Text style={styles.clearLabel}>Clear</Text>
      </Pressable>
    </View>
  );
}

export function ConnectionReference({
  entries,
  selectedWireIds = null,
  onSelectWire,
}: {
  entries: ConnectionEntry[];
  selectedWireIds?: readonly string[] | null;
  onSelectWire?: (wireIds: string[]) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (entries.length === 0) {
    return <Text style={styles.empty}>No wires are installed on this step yet.</Text>;
  }
  const groups: { name: string; entries: ConnectionEntry[] }[] = [];
  for (const entry of entries) {
    const group = groups.find((item) => item.name === entry.group);
    if (group) {
      group.entries.push(entry);
    } else {
      groups.push({ name: entry.group, entries: [entry] });
    }
  }
  return (
    <View style={styles.list}>
      {groups.map((group) => (
        <View key={group.name} style={styles.group}>
          <Text style={styles.groupLabel}>{group.name}</Text>
          {group.entries.map((entry) => {
            const selected = selectedWireIds != null && entry.wireIds.length > 0 && sameWireIds(entry.wireIds, selectedWireIds);
            const row = (
              <>
                <View style={styles.copy}>
                  <Text style={styles.title}>{entry.title}</Text>
                  {entry.detail ? <Text style={styles.detail}>{entry.detail}</Text> : null}
                </View>
                <Text style={styles.status}>{entry.status === 'this-step' ? 'This step' : 'Installed'}</Text>
              </>
            );
            if (!onSelectWire || entry.wireIds.length === 0) {
              return (
                <View key={entry.id} style={styles.row}>
                  {row}
                </View>
              );
            }
            return (
              <Pressable
                key={entry.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={entry.title}
                onPress={() => onSelectWire(entry.wireIds)}
                style={pressFeedback([styles.row, selected && styles.rowOn])}>
                {row}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    list: { gap: 12 },
    group: { gap: 6 },
    groupLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 4 },
    rowOn: { backgroundColor: colors.accentSoft },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    clear: { paddingVertical: 4, paddingHorizontal: 8 },
    clearLabel: { color: colors.accentStrong, fontSize: 14, fontWeight: '700' },
    copy: { flex: 1, gap: 2 },
    title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20 },
    detail: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
    status: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
    empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  });
}
