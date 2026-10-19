import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';
import type { ConnectionEntry } from '@/lib/connection-reference';

export function ConnectionReference({ entries }: { entries: ConnectionEntry[] }) {
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
          {group.entries.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.title}>{entry.title}</Text>
                {entry.detail ? <Text style={styles.detail}>{entry.detail}</Text> : null}
              </View>
              <Text style={styles.status}>{entry.status === 'this-step' ? 'This step' : 'Installed'}</Text>
            </View>
          ))}
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
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    copy: { flex: 1, gap: 2 },
    title: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 20 },
    detail: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
    status: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 2 },
    empty: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  });
}
