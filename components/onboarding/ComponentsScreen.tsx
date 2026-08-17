import MaskedView from '@react-native-masked-view/masked-view';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComponentPickerChip } from '@/components/onboarding/ComponentPickerChip';
import { OnboardingCta } from '@/components/onboarding/OnboardingCta';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import {
  ORANGE_ARC_SAGITTA,
  ORANGE_PANEL_WIDTH,
} from '@/components/onboarding/orange-panel-path';
import { OrangePanelSvg } from '@/components/onboarding/OrangePanelSvg';
import { SolderiColors } from '@/constants/colors';
import {
  COMPONENT_CATEGORY_LABELS,
  ONBOARDING_CONTINUE,
} from '@/constants/onboarding';
import { Spacing } from '@/constants/tokens';
import { getComponentsByCategory } from '@/context/onboarding-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ORANGE_PANEL_HEIGHT = Math.min(SCREEN_HEIGHT * 0.65, 580);
const ORANGE_LAYOUT_HEIGHT = ORANGE_PANEL_HEIGHT + ORANGE_ARC_SAGITTA;
const CTA_HEIGHT = 56;
const CTA_FOOTER_SPACE = CTA_HEIGHT + Spacing.lg + Spacing.md;

type ComponentsScreenProps = {
  selectedIds: string[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function ComponentsScreen({
  selectedIds,
  onToggle,
  onBack,
  onContinue,
}: ComponentsScreenProps) {
  const insets = useSafeAreaInsets();
  const count = selectedIds.length;
  const categories = getComponentsByCategory();
  const scrollBottomPadding = CTA_FOOTER_SPACE + Math.max(insets.bottom, Spacing.lg);

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
      </View>

      <View style={styles.topSpacer} />

      <View
        style={[
          styles.orangeSection,
          {
            height: ORANGE_LAYOUT_HEIGHT,
            marginTop: -ORANGE_ARC_SAGITTA,
          },
        ]}>
        <View style={styles.orangeBackground} pointerEvents="none">
          <OrangePanelSvg
            width={ORANGE_PANEL_WIDTH}
            height={ORANGE_LAYOUT_HEIGHT}
            color={SolderiColors.accent}
          />
        </View>

        <MaskedView
          style={styles.maskedScroll}
          androidRenderingMode="software"
          maskElement={
            <View style={styles.maskRoot}>
              <OrangePanelSvg
                width={ORANGE_PANEL_WIDTH}
                height={ORANGE_LAYOUT_HEIGHT}
                color="#000000"
              />
            </View>
          }>
          <ScrollView
            style={styles.orangeScroll}
            contentContainerStyle={[
              styles.orangeContent,
              { paddingBottom: scrollBottomPadding },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Animated.View entering={FadeInDown.duration(420)}>
              <Text style={styles.counter}>
                {count} component{count === 1 ? '' : 's'} added
              </Text>
            </Animated.View>

            <View style={styles.categories}>
              {categories.map((group, groupIndex) => (
                <Animated.View
                  key={group.category}
                  entering={FadeInDown.duration(420).delay(60 + groupIndex * 50)}
                  style={styles.categoryBlock}>
                  <Text style={styles.categoryLabel}>
                    {COMPONENT_CATEGORY_LABELS[group.category]}
                  </Text>
                  <View style={styles.chipRow}>
                    {group.items.map((component) => (
                      <ComponentPickerChip
                        key={component.id}
                        emoji={component.emoji}
                        label={component.name}
                        selected={selectedIds.includes(component.id)}
                        onPress={() => onToggle(component.id)}
                        onOrange
                      />
                    ))}
                  </View>
                </Animated.View>
              ))}
            </View>
          </ScrollView>
        </MaskedView>

        <View
          style={[styles.floatingCta, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}
          pointerEvents="box-none">
          <OnboardingCta
            label={ONBOARDING_CONTINUE}
            onPress={onContinue}
            disabled={count === 0}
            variant="surface"
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
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
    marginBottom: Spacing.md,
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
  topSpacer: {
    flex: 1,
    minHeight: Spacing.lg,
  },
  orangeSection: {
    position: 'relative',
    overflow: 'visible',
  },
  orangeBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  maskedScroll: {
    ...StyleSheet.absoluteFillObject,
  },
  maskRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  orangeScroll: {
    flex: 1,
  },
  orangeContent: {
    paddingTop: ORANGE_ARC_SAGITTA + Spacing.md,
    paddingHorizontal: 28,
    gap: Spacing.xl,
  },
  counter: {
    fontSize: 16,
    fontWeight: '700',
    color: SolderiColors.onAccent,
    textAlign: 'center',
  },
  categories: {
    gap: Spacing.xl,
  },
  categoryBlock: {
    gap: Spacing.md,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(24, 27, 30, 0.62)',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  floatingCta: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
});
