import { useCallback, useState, type ReactNode } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { SolderiColors } from '@/constants/colors';
import { Spacing } from '@/constants/tokens';

const CARD_GAP = Spacing.md;

type ContinueBuildingCarouselProps<T> = {
  items: T[];
  horizontalInset?: number;
  renderItem: (item: T, cardWidth: number) => ReactNode;
  keyExtractor: (item: T) => string;
};

function ContinueBuildingPager({ count, activeIndex }: { count: number; activeIndex: number }) {
  if (count <= 1) return null;

  return (
    <View style={styles.pager} accessibilityRole="tablist">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.pagerSegment,
            index === activeIndex ? styles.pagerSegmentActive : styles.pagerSegmentInactive,
          ]}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === activeIndex }}
        />
      ))}
    </View>
  );
}

export function ContinueBuildingCarousel<T>({
  items,
  horizontalInset = Spacing.xl,
  renderItem,
  keyExtractor,
}: ContinueBuildingCarouselProps<T>) {
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = screenWidth - horizontalInset * 2;
  const pageStride = cardWidth + CARD_GAP;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / pageStride);
      const clamped = Math.max(0, Math.min(nextIndex, items.length - 1));
      setActiveIndex((current) => (current === clamped ? current : clamped));
    },
    [items.length, pageStride],
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        decelerationRate="fast"
        snapToInterval={pageStride}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.list}>
        {items.map((item) => (
          <View key={keyExtractor(item)} style={{ width: cardWidth }}>
            {renderItem(item, cardWidth)}
          </View>
        ))}
      </ScrollView>

      <ContinueBuildingPager count={items.length} activeIndex={activeIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.md,
  },
  list: {
    gap: CARD_GAP,
  },
  pager: {
    flexDirection: 'row',
    gap: 8,
    height: 4,
  },
  pagerSegment: {
    flex: 1,
    borderRadius: 2,
  },
  pagerSegmentActive: {
    backgroundColor: SolderiColors.textSecondary,
  },
  pagerSegmentInactive: {
    backgroundColor: SolderiColors.borderSubtle,
  },
});
