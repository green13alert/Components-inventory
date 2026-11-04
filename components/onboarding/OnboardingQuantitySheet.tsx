import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { OnboardingOffer } from '@/constants/onboarding-offers';
import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';
import {
  adjustSheetQuantity,
  ONBOARDING_QUANTITY_LIMIT,
  sheetQuantitiesFromBench,
  type OnboardingComponentSelection,
  type OnboardingSheetQuantity,
} from '@/lib/onboarding-inventory';

type OnboardingQuantitySheetProps = {
  offer: OnboardingOffer | null;
  selected: readonly OnboardingComponentSelection[];
  onClose: () => void;
  onApply: (draft: readonly OnboardingSheetQuantity[]) => void;
};

export function OnboardingQuantitySheet({ offer, selected, onClose, onApply }: OnboardingQuantitySheetProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [draft, setDraft] = useState<OnboardingSheetQuantity[]>([]);
  const sheetHeight = Math.min(Math.round(screenHeight * 0.78), 560);

  useEffect(() => {
    if (!offer) {
      setDraft([]);
      return;
    }
    // Reload only when the sheet opens. Later bench updates must not wipe an unconfirmed edit.
    setDraft(sheetQuantitiesFromBench(offer.choices.map((choice) => choice.slug), selected));
    // `selected` is the bench at the moment the sheet opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);

  const chosen = draft.filter((item) => item.quantity > 0);
  const summary =
    chosen.length === 0
      ? 'None selected'
      : chosen
          .map((item) => {
            const name = offer?.choices.find((choice) => choice.slug === item.slug)?.name ?? item.slug;
            return `${name} ×${item.quantity}`;
          })
          .join('\n');

  const changeQuantity = (slug: string, quantity: number) => {
    setDraft((current) => adjustSheetQuantity(current, slug, quantity) ?? current);
  };

  return (
    <Modal visible={offer != null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismiss} onPress={onClose} accessibilityLabel="Close part details" />
        {offer ? (
          <View style={[styles.sheet, { height: sheetHeight, paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
            <View style={styles.handle} />
            <Text style={styles.title}>{offer.title}</Text>
            <Text style={styles.guidance}>{offer.guidance}</Text>
            <ScrollView style={styles.choices} contentContainerStyle={styles.choiceList} bounces={false}>
              {offer.choices.map((item) => {
                const quantity = draft.find((entry) => entry.slug === item.slug)?.quantity ?? 0;
                const active = quantity > 0;
                return (
                  <View
                    key={item.slug}
                    style={[styles.choice, active && styles.choiceActive]}
                    accessibilityState={{ selected: active }}>
                    <View style={styles.choiceCopy}>
                      <Text style={styles.choiceName}>{item.name}</Text>
                      <Text style={styles.choiceHint}>{item.hint}</Text>
                    </View>
                    <View style={styles.stepper}>
                      <Pressable
                        style={styles.stepButton}
                        onPress={() => changeQuantity(item.slug, quantity - 1)}
                        disabled={quantity <= 0}
                        accessibilityRole="button"
                        accessibilityLabel={`Decrease ${item.name}`}>
                        <Ionicons name="remove" size={18} color={colors.textPrimary} />
                      </Pressable>
                      <Text
                        style={[styles.quantity, active ? styles.quantitySelected : styles.quantityEmpty]}
                        accessibilityLabel={`${item.name} quantity ${quantity}`}>
                        {quantity}
                      </Text>
                      <Pressable
                        style={styles.stepButton}
                        onPress={() => changeQuantity(item.slug, quantity + 1)}
                        disabled={quantity >= ONBOARDING_QUANTITY_LIMIT}
                        accessibilityRole="button"
                        accessibilityLabel={`Increase ${item.name}`}>
                        <Ionicons name="add" size={18} color={colors.textPrimary} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.summary} numberOfLines={4}>
              {summary}
            </Text>
            <Pressable
              style={styles.confirm}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel={chosen.length === 0 ? 'Add none' : `Add ${chosen.length}`}>
              <Text style={styles.confirmLabel}>{chosen.length === 0 ? 'Add' : `Add ${chosen.length}`}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    dismiss: {
      flex: 1,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: Radii['2xl'],
      borderTopRightRadius: Radii['2xl'],
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: Spacing.sm,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.4,
      color: colors.textPrimary,
    },
    guidance: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    choices: {
      flex: 1,
    },
    choiceList: {
      gap: Spacing.sm,
      paddingVertical: Spacing.xs,
    },
    choice: {
      minHeight: 72,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    choiceActive: {
      borderColor: colors.accentBorder,
      backgroundColor: colors.accentMuted,
    },
    choiceCopy: {
      flex: 1,
      gap: 2,
    },
    choiceName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    choiceHint: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    stepButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quantity: {
      minWidth: 28,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
    },
    quantitySelected: {
      color: colors.accent,
    },
    quantityEmpty: {
      color: colors.textMuted,
    },
    summary: {
      fontSize: 14,
      fontWeight: '700',
      lineHeight: 20,
      color: colors.textPrimary,
    },
    confirm: {
      minHeight: 48,
      borderRadius: Radii.lg,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
  });
}
