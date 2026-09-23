import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

export type ExplainCodeContext = {
  code: string;
  language: string;
  filename?: string;
  projectId?: string;
  projectSlug?: string;
  projectTitle?: string;
  stepIndex?: number;
};

type ExplainCodeButtonProps = {
  context: ExplainCodeContext;
};

export function ExplainCodeButton({ context }: ExplainCodeButtonProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Explain Code"
        accessibilityHint={
          context.filename
            ? `Opens a coming-soon explanation for ${context.filename}`
            : 'Opens a coming-soon explanation for the displayed code'
        }>
        <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
        <Text style={styles.buttonLabel}>Explain Code</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close" />
          <View style={styles.sheet}>
            <Text style={styles.title}>Explain Code</Text>
            <Text style={styles.body}>AI code explanations are coming soon.</Text>
            <Pressable
              style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]}
              onPress={() => setVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Text style={styles.closeLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radii.md,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.accent,
    },
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
      padding: Spacing.xl,
      gap: Spacing.md,
    },
    title: {
      ...Typography.cardTitle,
      color: colors.textPrimary,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
    },
    closeButton: {
      marginTop: Spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.md,
      borderRadius: Radii.md,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeLabel: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
}
