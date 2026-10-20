import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';
import {
  type ComponentKeyGroup,
  type ComponentKeyInstance,
  type KeySelection,
} from '@/lib/component-key';

type ComponentKeyProps = {
  groups: ComponentKeyGroup[];
  selection: KeySelection | null;
  onSelect: (selection: KeySelection) => void;
};

function groupStatus(group: ComponentKeyGroup) {
  const ready = group.instances.filter((instance) => instance.installed).length;
  if (ready === 0) {
    return 'Not yet installed';
  }
  if (ready === group.instances.length) {
    return 'On the board';
  }
  return `${ready} of ${group.instances.length} on the board`;
}

function instanceSelected(selection: KeySelection | null, instance: ComponentKeyInstance) {
  return selection?.kind === 'instance' && selection.id === instance.id;
}

export function SelectedPartCard({
  groups,
  selection,
  onClear,
}: {
  groups: ComponentKeyGroup[];
  selection: KeySelection;
  onClear: () => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const chosen =
    selection.kind === 'instance'
      ? groups.flatMap((group) => group.instances.map((instance) => ({ group, instance }))).find((item) => item.instance.id === selection.id)
      : null;
  const chosenGroup = selection.kind === 'group' ? groups.find((group) => group.catalogueId === selection.catalogueId) : null;
  if (!chosen && !chosenGroup) {
    return null;
  }
  const illustrationId = chosen?.group.illustrationId ?? chosenGroup?.illustrationId;
  const title = chosen ? `${chosen.instance.label} — ${chosen.group.name}` : chosenGroup?.name;
  return (
    <View style={styles.detail}>
      <View style={styles.detailRow}>
        {illustrationId ? <ComponentIllustration id={illustrationId} size={48} plate={false} showGroundShadow={false} /> : null}
        <View style={styles.detailCopy}>
          <Text style={styles.detailTitle}>{title}</Text>
          {chosen ? <Text style={styles.detailBody}>{chosen.instance.role}</Text> : null}
          {chosen?.instance.orientation ? <Text style={styles.detailBody}>{chosen.instance.orientation}</Text> : null}
          {chosen?.instance.pins ? <Text style={styles.detailBody}>{chosen.instance.pins}</Text> : null}
          {chosen && !chosen.instance.installed ? (
            <Text style={styles.detailBody}>Not yet installed. Its place on the board stays hidden.</Text>
          ) : null}
          {chosenGroup ? <Text style={styles.detailBody}>{chosenGroup.summary}</Text> : null}
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Clear component selection" onPress={onClear} style={styles.clear}>
        <Text style={styles.clearLabel}>Clear</Text>
      </Pressable>
    </View>
  );
}

export function ComponentKey({ groups, selection, onSelect }: ComponentKeyProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [openIds, setOpenIds] = useState<string[]>([]);

  useEffect(() => {
    if (selection?.kind !== 'instance') {
      return;
    }
    const group = groups.find((item) => item.instances.some((instance) => instance.id === selection.id));
    if (!group || group.instances.length < 2) {
      return;
    }
    setOpenIds((current) => (current.includes(group.catalogueId) ? current : [...current, group.catalogueId]));
  }, [groups, selection]);

  return (
    <View style={styles.wrap}>
      {groups.map((group) => {
        const repeated = group.instances.length > 1;
        const open = repeated && openIds.includes(group.catalogueId);
        const groupOn = selection?.kind === 'group' && selection.catalogueId === group.catalogueId;
        const status = groupStatus(group);
        return (
          <View key={group.catalogueId} style={styles.group}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: repeated ? open : undefined, selected: groupOn }}
              accessibilityLabel={`${group.name}, ${group.instances.length}, ${status}`}
              onPress={() => {
                if (!repeated) {
                  onSelect({ kind: 'instance', id: group.instances[0].id });
                  return;
                }
                if (open) {
                  setOpenIds((current) => current.filter((id) => id !== group.catalogueId));
                  return;
                }
                setOpenIds((current) => [...current, group.catalogueId]);
                onSelect({ kind: 'group', catalogueId: group.catalogueId });
              }}
              style={[styles.row, groupOn && styles.rowOn]}>
              <ComponentIllustration id={group.illustrationId} size={40} plate={false} showGroundShadow={false} />
              <View style={styles.copy}>
                <Text style={styles.name}>
                  {group.name}
                  {repeated ? ` ×${group.instances.length}` : ''}
                </Text>
                <Text style={styles.status}>{status}</Text>
              </View>
              {repeated ? (
                <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={18} color={colors.textMuted} />
              ) : null}
            </Pressable>
            {open
              ? group.instances.map((instance) => {
                  const on = instanceSelected(selection, instance);
                  return (
                    <Pressable
                      key={instance.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${instance.label}, ${instance.role}, ${instance.installed ? 'on the board' : 'not yet installed'}`}
                      onPress={() => onSelect({ kind: 'instance', id: instance.id })}
                      style={[styles.instance, on && styles.rowOn]}>
                      <View style={styles.instanceCopy}>
                        <Text style={styles.instanceLabel}>{instance.label}</Text>
                        <Text style={styles.role}>{instance.role}</Text>
                        <Text style={styles.status}>{instance.installed ? 'On the board' : 'Not yet installed'}</Text>
                      </View>
                    </Pressable>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    wrap: { gap: 8 },
    detail: { gap: 4 },
    detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    detailCopy: { flex: 1, gap: 4 },
    detailTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
    detailBody: { color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
    clear: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
    clearLabel: { color: colors.accent, fontSize: 15, fontWeight: '700' },
    group: { gap: 4 },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 4,
      paddingHorizontal: 4,
      borderRadius: 12,
    },
    rowOn: { backgroundColor: colors.accentSoft },
    copy: { flex: 1, gap: 2 },
    name: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
    status: { color: colors.textSecondary, fontSize: 13 },
    instance: {
      minHeight: 44,
      marginLeft: 28,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    instanceCopy: { flex: 1, gap: 2 },
    instanceLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
    role: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  });
}
