import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { WorkbenchCategoryTabs } from '@/components/onboarding/WorkbenchCategoryTabs';
import { WorkbenchComponentTile } from '@/components/onboarding/WorkbenchComponentTile';
import { WorkbenchSurface } from '@/components/onboarding/WorkbenchSurface';
import { SolderiColors } from '@/constants/colors';
import {
  ONBOARDING_COMPONENTS,
  ONBOARDING_CONTINUE,
  type ComponentCategory,
  type OnboardingComponent,
} from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';

type ComponentsScreenProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

const SURFACE_HEIGHT = 196;

export function ComponentsScreen({
  selectedIds,
  onToggle,
  onBack,
  onContinue,
}: ComponentsScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('boards');
  const count = selectedIds.length;

  const categoryComponents = useMemo(
    () => ONBOARDING_COMPONENTS.filter((component) => component.category === activeCategory),
    [activeCategory],
  );

  const selectedComponents = useMemo(
    () =>
      selectedIds
        .map((id) => ONBOARDING_COMPONENTS.find((component) => component.id === id))
        .filter(Boolean) as OnboardingComponent[],
    [selectedIds],
  );

  const countLabel =
    count === 0 ? '0 components' : `${count} component${count === 1 ? '' : 's'}`;

  return (
    <View style={styles.screen}>
      <View style={[styles.topSection, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={SolderiColors.textPrimary} />
          </Pressable>
          <View style={styles.progressWrap}>
            <OnboardingProgress currentStep={3} />
          </View>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.title}>What&apos;s in your workshop?</Text>
          <Text style={styles.description}>
            Add some components you already own and we&apos;ll use them to find projects you can build.
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
        <ScrollView
          style={styles.workbenchScroll}
          contentContainerStyle={[
            styles.workbenchContent,
            { paddingBottom: 100 + Math.max(insets.bottom, Spacing.lg) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={[styles.surfaceStage, { height: SURFACE_HEIGHT + 48 }]}>
            <WorkbenchSurface width={screenWidth} height={SURFACE_HEIGHT} />

            <View style={styles.surfaceOverlay} pointerEvents="box-none">
              <Text style={styles.surfaceLabel}>On your bench</Text>
              {selectedComponents.length === 0 ? (
                <Text style={styles.emptyBenchText}>
                  Tap components below to place them on your bench
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.collectionRow}
                  style={styles.collectionScroll}>
                  {selectedComponents.map((component) => (
                    <Animated.View
                      key={component.id}
                      layout={Layout.springify()}
                      entering={FadeInDown.duration(280)}>
                      <WorkbenchComponentTile
                        componentId={component.id}
                        label={component.name}
                        selected
                        compact
                        onSurface
                        onPress={() => onToggle(component.id)}
                      />
                    </Animated.View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.pickerSection}>
            <WorkbenchCategoryTabs active={activeCategory} onChange={setActiveCategory} />

            <Animated.View
              key={activeCategory}
              entering={FadeIn.duration(260)}
              style={styles.pickerGrid}>
              {categoryComponents.map((component, index) => (
                <Animated.View
                  key={component.id}
                  entering={FadeInDown.duration(320).delay(index * 40)}
                  style={styles.pickerCell}>
                  <WorkbenchComponentTile
                    componentId={component.id}
                    label={component.name}
                    selected={selectedIds.includes(component.id)}
                    onPress={() => onToggle(component.id)}
                  />
                </Animated.View>
              ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SolderiColors.background,
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
    color: SolderiColors.textPrimary,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: SolderiColors.textSecondary,
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
    color: SolderiColors.textMuted,
  },
  inventoryCount: {
    fontSize: 15,
    fontWeight: '700',
    color: SolderiColors.accent,
  },
  workbenchZone: {
    flex: 1,
  },
  workbenchScroll: {
    flex: 1,
  },
  workbenchContent: {
    gap: Spacing.lg,
  },
  surfaceStage: {
    position: 'relative',
    marginTop: Spacing.xs,
  },
  surfaceOverlay: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 72,
    bottom: 28,
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  surfaceLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: SolderiColors.textMuted,
    opacity: 0.85,
  },
  emptyBenchText: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
    opacity: 0.75,
    marginTop: Spacing.sm,
  },
  collectionScroll: {
    flexGrow: 0,
    marginTop: Spacing.xs,
  },
  collectionRow: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'flex-end',
  },
  pickerSection: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
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
