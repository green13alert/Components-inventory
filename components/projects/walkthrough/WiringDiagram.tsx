import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { HW } from '@/constants/component-illustration-palette';
import type { SolderiPalette } from '@/constants/colors';
import type { StepConnection, WiringNode, WiringPair } from '@/constants/walkthrough-content';
import { useSolderiColors } from '@/context/theme-context';

const WIRE_COLORS = [HW.wireRed, HW.wireBlack, HW.wireGreen, HW.wireYellow] as const;

type WiringDiagramProps = {
  heading?: string;
  pair?: WiringPair;
  nodes?: WiringNode[];
  connections: StepConnection[];
};

function resolveNodes(pair?: WiringPair, nodes?: WiringNode[]): WiringNode[] {
  if (nodes && nodes.length > 0) {
    return nodes;
  }
  if (!pair) {
    return [];
  }
  return [
    { id: pair.leftId, name: pair.leftName, illustrationId: pair.leftId },
    { id: pair.rightId, name: pair.rightName, illustrationId: pair.rightId },
  ];
}

function wireColor(connection: StepConnection, index: number) {
  if (connection.signal === 'power') {
    return HW.wireRed;
  }
  if (connection.signal === 'ground') {
    return HW.wireBlack;
  }
  if (connection.signal === 'signal') {
    return HW.wireGreen;
  }
  return WIRE_COLORS[index % WIRE_COLORS.length];
}

export function WiringDiagram({ heading, pair, nodes, connections }: WiringDiagramProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedNodes = resolveNodes(pair, nodes);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{heading ?? 'Wiring diagram'}</Text>
      <View style={styles.canvas}>
        {resolvedNodes.length > 0 ? (
          <View style={styles.endpoints}>
            {resolvedNodes.map((node) => (
              <View key={node.id} style={styles.endpoint}>
                <ComponentIllustration id={node.illustrationId} name={node.name} size={56} plate />
                <Text style={styles.endpointName} numberOfLines={2}>
                  {node.name}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.wires}>
          {connections.map((row, index) => {
            const color = wireColor(row, index);
            return (
              <View
                key={`${row.fromComponent}-${row.fromPin}-${row.toComponent}-${row.toPin}-${index}`}
                style={styles.wireRow}>
                <View style={styles.pinColumn}>
                  <Text style={styles.pinName} numberOfLines={1}>
                    {row.fromComponent}
                  </Text>
                  <Text style={styles.pinId} numberOfLines={1}>
                    {row.fromPin}
                  </Text>
                </View>
                <View style={styles.lineWrap}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <View style={[styles.line, { backgroundColor: color }]} />
                  <View style={[styles.dot, { backgroundColor: color }]} />
                </View>
                <View style={[styles.pinColumn, styles.pinColumnRight]}>
                  <Text style={styles.pinName} numberOfLines={1}>
                    {row.toComponent}
                  </Text>
                  <Text style={styles.pinId} numberOfLines={1}>
                    {row.toPin}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    section: {
      gap: 10,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    canvas: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 18,
      gap: 18,
    },
    endpoints: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: 16,
    },
    endpoint: {
      width: 88,
      alignItems: 'center',
      gap: 8,
    },
    endpointName: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    wires: {
      gap: 14,
    },
    wireRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pinColumn: {
      width: 92,
      gap: 2,
    },
    pinColumnRight: {
      alignItems: 'flex-end',
    },
    pinName: {
      fontSize: 11,
      color: colors.textMuted,
    },
    pinId: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    lineWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    line: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      opacity: 0.9,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
}
