import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { WorkbenchCategoryTabs } from '@/components/onboarding/WorkbenchCategoryTabs';
import { OnboardingQuantitySheet } from '@/components/onboarding/OnboardingQuantitySheet';
import { WorkbenchComponentTile } from '@/components/onboarding/WorkbenchComponentTile';
import { WorkbenchSurface, getBenchFaceOverlayInsets } from '@/components/onboarding/WorkbenchSurface';
import type { SolderiPalette } from '@/constants/colors';
import { ONBOARDING_CONTINUE, type ComponentCategory } from '@/constants/onboarding';
import { getOnboardingChoice, getOnboardingOffers, type OnboardingOffer } from '@/constants/onboarding-offers';
import type { OnboardingComponentSelection, OnboardingSheetQuantity } from '@/lib/onboarding-inventory';
import { Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

type ComponentsScreenProps = {
  selected: readonly OnboardingComponentSelection[];
  onApply: (draft: readonly OnboardingSheetQuantity[]) => void;
  onRemove: (slug: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

const SURFACE_HEIGHT = 280;
const BENCH_TILE_WIDTH = 52;
const BENCH_TILE_HEIGHT = 60;
const BENCH_ROW_GAP = 10;
const BENCH_COL_GAP = 10;
const BENCH_ROW_COUNT = 2;
const BENCH_LABEL_WIDTH = 92;
const STAGE_EXTRA_HEIGHT = 32;
/** Extra room above the grid for lift animation + check badge. */
const BENCH_SCROLL_TOP_PAD = 14;
const BENCH_GRID_HEIGHT = BENCH_TILE_HEIGHT * BENCH_ROW_COUNT + BENCH_ROW_GAP;
const BENCH_SCROLL_AREA_HEIGHT = BENCH_SCROLL_TOP_PAD + BENCH_GRID_HEIGHT + 8;
const HORIZONTAL_INSET = 28;

export function ComponentsScreen({
  selected,
  onApply,
  onRemove,
  onBack,
  onContinue,
}: ComponentsScreenProps) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('boards');
  const [activeOffer, setActiveOffer] = useState<OnboardingOffer | null>(null);
  const count = selected.length;
  const pieceCount = selected.reduce((sum, item) => sum + item.quantity, 0);

  const categoryOffers = useMemo(() => getOnboardingOffers(activeCategory), [activeCategory]);

  const selectedComponents = useMemo(
    () =>
      selected
        .map((item) => {
          const choice = getOnboardingChoice(item.slug);
          return choice ? { ...choice, quantity: item.quantity } : null;
        })
        .filter((item): item is NonNullable<typeof item> => item != null),
    [selected],
  );

  const countLabel =
    count === 0 ? '0 parts' : `${pieceCount} owned · ${count} part${count === 1 ? '' : 's'}`;

  const surfaceHeight = SURFACE_HEIGHT;
  const stageHeight = surfaceHeight + STAGE_EXTRA_HEIGHT;
  const benchOverlayInsets = getBenchFaceOverlayInsets(surfaceHeight, stageHeight);
  const isBenchEmpty = selectedComponents.length === 0;

  const benchColumns = useMemo(() => {
    const columns: (typeof selectedComponents[number] | undefined)[][] = [];
    const columnCount = Math.max(1, Math.ceil(selectedComponents.length / BENCH_ROW_COUNT));

    for (let col = 0; col < columnCount; col += 1) {
      columns.push([
        selectedComponents[col * BENCH_ROW_COUNT],
        selectedComponents[col * BENCH_ROW_COUNT + 1],
      ]);
    }

    return columns;
  }, [selectedComponents]);

  const benchGridWidth =
    benchColumns.length * BENCH_TILE_WIDTH + Math.max(0, benchColumns.length - 1) * BENCH_COL_GAP;

  const benchScrollViewportWidth =
    screenWidth - HORIZONTAL_INSET * 2 - BENCH_LABEL_WIDTH - Spacing.sm;
  const benchOverflows = benchGridWidth > benchScrollViewportWidth;

  return (
    <View style={styles.screen}>
      <View style={[styles.topSection, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={3} />
          </View>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>What&apos;s in your workshop?</Text>
          <Text style={styles.description}>
            Choose a part, the exact type if you know it, and how many you have.
          </Text>
        </View>

        <View style={styles.inventoryBar}>
          <Text style={styles.inventoryLabel}>Your workshop</Text>
          <Animated.Text entering={FadeIn.duration(240)} key={countLabel} style={styles.inventoryCount}>
            {countLabel}
          </Animated.Text>
        </View>
      </View>

      <View style={styles.workbenchZone}>
        <View style={[styles.surfaceStage, { height: stageHeight }]}>
          <WorkbenchSurface width={screenWidth} height={surfaceHeight} />

          <View style={[styles.surfaceOverlay, benchOverlayInsets]}>
            {isBenchEmpty ? (
              <View style={styles.emptyBench}>
                <Text style={styles.surfaceLabel}>On your bench</Text>
                <Text style={styles.emptyBenchText}>
                  Tap components below to place them on your bench
                </Text>
              </View>
            ) : (
              <View style={styles.benchCollection}>
                <Text style={[styles.surfaceLabel, styles.benchLabel]}>On your bench</Text>
                <View style={styles.benchScrollWrap}>
                  <ScrollView
                    horizontal
                    nestedScrollEnabled
                    directionalLockEnabled
                    alwaysBounceVertical={false}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={benchOverflows}
                    persistentScrollbar={benchOverflows}
                    scrollEnabled={benchOverflows}
                    scrollEventThrottle={16}
                    style={styles.benchScroll}
                    contentContainerStyle={styles.benchScrollContent}>
                    <View style={[styles.benchGrid, { width: benchGridWidth }]}>
                      {benchColumns.map((column, columnIndex) => (
                        <View key={`col-${columnIndex}`} style={styles.benchColumn}>
                          {column.map((component, rowIndex) =>
                            component ? (
                              <View key={component.slug} style={styles.benchTileSlot}>
                                <WorkbenchComponentTile
                                  componentId={component.slug}
                                  label={component.name}
                                  quantity={component.quantity}
                                  selected
                                  compact
                                  onSurface
                                  onPress={() => onRemove(component.slug)}
                                />
                              </View>
                            ) : (
                              <View key={`empty-${columnIndex}-${rowIndex}`} style={styles.benchTileSlot} />
                            ),
                          )}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  {benchOverflows ? (
                    <View style={styles.benchScrollHint} pointerEvents="none">
                      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.pickerScroll}
          contentContainerStyle={[
            styles.pickerScrollContent,
            { paddingBottom: 100 + Math.max(insets.bottom, Spacing.lg) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.pickerSection}>
            <WorkbenchCategoryTabs active={activeCategory} onChange={setActiveCategory} />

            <Animated.View
              key={activeCategory}
              entering={FadeIn.duration(260)}
              style={styles.pickerGrid}>
              {categoryOffers.map((offer, index) => {
                const chosen = offer.choices
                  .map((choice) => selected.find((item) => item.slug === choice.slug))
                  .filter((item): item is OnboardingComponentSelection => item != null);
                const detail = chosen
                  .map((item) => `${getOnboardingChoice(item.slug)?.name ?? item.slug} ×${item.quantity}`)
                  .join(' · ');
                return (
                  <Animated.View
                    key={offer.id}
                    entering={FadeInDown.duration(320).delay(index * 40)}
                    style={styles.pickerCell}>
                    <WorkbenchComponentTile
                      componentId={offer.image}
                      label={offer.title}
                      detail={detail || undefined}
                      selected={chosen.length > 0}
                      onPress={() => setActiveOffer(offer)}
                    />
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>
        </ScrollView>

        <View
          style={[styles.floatingCta, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}
          pointerEvents="box-none">
          <OnboardingCta
            label={ONBOARDING_CONTINUE}
            onPress={onContinue}
            disabled={count === 0}
          />
        </View>
      </View>
      <OnboardingQuantitySheet
        offer={activeOffer}
        selected={selected}
        onClose={() => setActiveOffer(null)}
        onApply={onApply}
      />
    </View>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topSection: {
      paddingHorizontal: 28,
      zIndex: 2,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backSpacer: {
      width: 40,
    },
    progressWrap: {
      flex: 1,
    },
    headerCopy: {
      gap: 8,
      marginBottom: Spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      letterSpacing: -0.6,
      lineHeight: 34,
      color: colors.textPrimary,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      maxWidth: 320,
    },
    inventoryBar: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    inventoryLabel: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.textMuted,
    },
    inventoryCount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.accent,
    },
    workbenchZone: {
      flex: 1,
    },
    pickerScroll: {
      flex: 1,
    },
    pickerScrollContent: {
      flexGrow: 1,
    },
    surfaceStage: {
      position: 'relative',
      marginTop: Spacing.xs,
      marginBottom: -Spacing.sm,
    },
    surfaceOverlay: {
      position: 'absolute',
      left: 28,
      right: 28,
      justifyContent: 'flex-start',
    },
    emptyBench: {
      flex: 1,
      paddingTop: Spacing.sm,
      gap: Spacing.sm,
      paddingHorizontal: Spacing.xs,
    },
    surfaceLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.textMuted,
      opacity: 0.85,
    },
    benchLabel: {
      width: BENCH_LABEL_WIDTH,
      paddingTop: BENCH_SCROLL_TOP_PAD + 18,
    },
    benchCollection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    benchScrollWrap: {
      flex: 1,
      height: BENCH_SCROLL_AREA_HEIGHT,
      position: 'relative',
    },
    benchScroll: {
      flex: 1,
      height: BENCH_SCROLL_AREA_HEIGHT,
    },
    benchScrollContent: {
      height: BENCH_SCROLL_AREA_HEIGHT,
      paddingTop: BENCH_SCROLL_TOP_PAD,
      paddingRight: Spacing.lg,
      alignItems: 'flex-start',
    },
    benchScrollHint: {
      position: 'absolute',
      right: 0,
      top: BENCH_SCROLL_TOP_PAD + BENCH_GRID_HEIGHT / 2 - 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.overlayLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    benchGrid: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      height: BENCH_GRID_HEIGHT,
      gap: BENCH_COL_GAP,
    },
    benchColumn: {
      gap: BENCH_ROW_GAP,
    },
    benchTileSlot: {
      width: BENCH_TILE_WIDTH,
      height: BENCH_TILE_HEIGHT,
    },
    emptyBenchText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSecondary,
      opacity: 0.8,
      maxWidth: 260,
    },
    pickerSection: {
      gap: Spacing.md,
      paddingTop: Spacing.xs,
    },
    pickerGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      justifyContent: 'space-between',
    },
    pickerCell: {
      width: '48%',
    },
    floatingCta: {
      position: 'absolute',
      left: 28,
      right: 28,
      bottom: 0,
      zIndex: 2,
    },
  });
}
