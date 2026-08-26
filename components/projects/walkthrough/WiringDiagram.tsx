import { StyleSheet, Text, View } from 'react-native';

import { ComponentIllustration } from '@/components/components/ComponentIllustration';
import { HW } from '@/constants/component-illustration-palette';
import { SolderiColors } from '@/constants/colors';
import type { StepConnection, WiringPair } from '@/constants/walkthrough-content';

const WIRE_COLORS = [HW.wireRed, HW.wireBlack, HW.wireGreen, HW.wireYellow] as const;

type WiringDiagramProps = {
  pair: WiringPair;
  connections: StepConnection[];
};

export function WiringDiagram({ pair, connections }: WiringDiagramProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Wiring</Text>
      <View style={styles.canvas}>
        <View style={styles.endpoints}>
          <View style={styles.endpoint}>
            <ComponentIllustration id={pair.leftId} name={pair.leftName} size={64} plate />
            <Text style={styles.endpointName} numberOfLines={2}>
              {pair.leftName}
            </Text>
          </View>
          <View style={styles.endpoint}>
            <ComponentIllustration id={pair.rightId} name={pair.rightName} size={64} plate />
            <Text style={styles.endpointName} numberOfLines={2}>
              {pair.rightName}
            </Text>
          </View>
        </View>

        <View style={styles.wires}>
          {connections.map((row, index) => {
            const color = WIRE_COLORS[index % WIRE_COLORS.length];
            return (
              <View key={`${row.fromPin}-${row.toPin}`} style={styles.wireRow}>
                <Text style={styles.pinLeft} numberOfLines={1}>
                  {row.toPin}
                </Text>
                <View style={styles.lineWrap}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <View style={[styles.line, { backgroundColor: color }]} />
                  <View style={[styles.dot, { backgroundColor: color }]} />
                </View>
                <Text style={styles.pinRight} numberOfLines={1}>
                  {row.fromPin}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: SolderiColors.textMuted,
  },
  canvas: {
    backgroundColor: SolderiColors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    paddingHorizontal: 14,
    paddingVertical: 18,
    gap: 18,
    minHeight: 240,
  },
  endpoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  endpoint: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  endpointName: {
    fontSize: 12,
    fontWeight: '700',
    color: SolderiColors.textSecondary,
    textAlign: 'center',
  },
  wires: {
    gap: 12,
  },
  wireRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pinLeft: {
    width: 52,
    fontSize: 12,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
    textAlign: 'right',
  },
  pinRight: {
    width: 52,
    fontSize: 12,
    fontWeight: '700',
    color: SolderiColors.textPrimary,
    textAlign: 'left',
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
