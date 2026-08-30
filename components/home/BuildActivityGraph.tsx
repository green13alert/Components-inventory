import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';

import { SectionHeading } from '@/components/home/SectionHeading';
import type { SolderiPalette } from '@/constants/colors';
import {
  ActivityLevel,
  CELL_GAP,
  createMockActivityByDate,
  formatActivityDate,
  getDefaultActivityRange,
  getYearMonthRegions,
  getYearPageGrid,
  MonthRegion,
  toDateKey,
  YearGrid,
  computeYearMetrics,
  CALENDAR_COLUMNS,
  YEAR_PAGE_COUNT,
} from '@/constants/build-activity';
import { Spacing, Typography } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';

const CELL_RADIUS = 3;

function getLevelColors(colors: SolderiPalette): Record<ActivityLevel, string> {
  return {
    0: colors.graphEmpty,
    1: 'rgba(255, 181, 71, 0.20)',
    2: 'rgba(255, 181, 71, 0.42)',
    3: 'rgba(255, 181, 71, 0.68)',
    4: colors.accent,
  };
}

export function BuildActivitySection() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [yearPageIndex, setYearPageIndex] = useState(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  const activityByDate = useMemo(() => {
    const range = getDefaultActivityRange();
    return createMockActivityByDate(range.start, range.end);
  }, []);

  const selectedYear = new Date().getFullYear();
  const yearPages = useMemo(
    () =>
      Array.from({ length: YEAR_PAGE_COUNT }, (_, pageIndex) =>
        getYearPageGrid(selectedYear, pageIndex, activityByDate),
      ),
    [selectedYear, activityByDate],
  );

  const gridHeight = useMemo(() => {
    if (containerWidth <= 0) return 0;

    const heights = yearPages.map((page) =>
      computeYearMetrics(containerWidth, page.weeks.length).gridHeight,
    );

    return Math.max(...heights);
  }, [containerWidth, yearPages]);

  const onSelectDate = useCallback((dateKey: string) => {
    setSelectedDateKey(dateKey);
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const onYearScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const page = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
    setYearPageIndex(page);
  };

  const ready = containerWidth > 0 && gridHeight > 0;

  const selectedDateLabel = useMemo(() => {
    if (!selectedDateKey) return null;

    const [year, month, day] = selectedDateKey.split('-').map(Number);
    return formatActivityDate(new Date(year, month - 1, day));
  }, [selectedDateKey]);

  return (
    <View style={styles.section}>
      <SectionHeading title="Build Activity" />

      <View style={styles.graph} onLayout={onLayout}>
        {ready ? (
          <YearView
            pages={yearPages}
            containerWidth={containerWidth}
            gridHeight={gridHeight}
            gap={CELL_GAP}
            scrollRef={yearScrollRef}
            activePageIndex={yearPageIndex}
            selectedDateKey={selectedDateKey}
            onSelectDate={onSelectDate}
            onScrollEnd={onYearScrollEnd}
          />
        ) : null}
      </View>

      {selectedDateLabel ? (
        <Text style={styles.selectedDateLabel}>{selectedDateLabel}</Text>
      ) : null}
    </View>
  );
}

function YearView({
  pages,
  containerWidth,
  gridHeight,
  gap,
  scrollRef,
  activePageIndex,
  selectedDateKey,
  onSelectDate,
  onScrollEnd,
}: {
  pages: YearGrid[];
  containerWidth: number;
  gridHeight: number;
  gap: number;
  scrollRef: React.RefObject<ScrollView | null>;
  activePageIndex: number;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  onScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.yearView}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        keyboardShouldPersistTaps="always"
        onMomentumScrollEnd={onScrollEnd}
        contentOffset={{ x: activePageIndex * containerWidth, y: 0 }}>
        {pages.map((page, pageIndex) => {
          const monthRegions = getYearMonthRegions(page.weeks);

          return (
            <View key={`year-page-${pageIndex}`} style={{ width: containerWidth }}>
              <YearPage
                weeks={page.weeks}
                monthRegions={monthRegions}
                containerWidth={containerWidth}
                gridHeight={gridHeight}
                gap={gap}
                selectedDateKey={selectedDateKey}
                onSelectDate={onSelectDate}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.yearPager}>
        {pages.map((_, index) => (
          <View
            key={`pager-${index}`}
            style={[styles.yearPagerDot, index === activePageIndex && styles.yearPagerDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

function YearPage({
  weeks,
  monthRegions,
  containerWidth,
  gridHeight,
  gap,
  selectedDateKey,
  onSelectDate,
}: {
  weeks: YearGrid['weeks'];
  monthRegions: MonthRegion[];
  containerWidth: number;
  gridHeight: number;
  gap: number;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const weekCount = weeks.length;
  const cellSize =
    weekCount > 0 ? (containerWidth - (weekCount - 1) * gap) / weekCount : 0;
  const rowSlotHeight =
    (gridHeight - (CALENDAR_COLUMNS - 1) * gap) / CALENDAR_COLUMNS;

  return (
    <View style={styles.yearPage}>
      <View style={[styles.monthLabelRow, { gap }]}>
        {monthRegions.map((region, index) => (
          <View key={`${region.label}-${index}`} style={{ flex: region.spanWeeks }}>
            <Text
              style={styles.monthLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {region.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.yearGrid, { height: gridHeight, gap }]}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={[styles.yearWeekColumn, { gap }]}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <View
                    key={`${weekIndex}-${dayIndex}`}
                    style={[styles.cellSlot, { height: rowSlotHeight }]}>
                    <View style={[styles.emptyCell, { width: cellSize, height: cellSize }]} />
                  </View>
                );
              }

              const dateKey = toDateKey(day.date);

              return (
                <View
                  key={`${weekIndex}-${dayIndex}`}
                  style={[styles.cellSlot, { height: rowSlotHeight }]}>
                  <ActivityCell
                    dateKey={dateKey}
                    level={day.level}
                    cellSize={cellSize}
                    selected={selectedDateKey === dateKey}
                    onSelectDate={onSelectDate}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const ActivityCell = memo(function ActivityCell({
  dateKey,
  level,
  cellSize,
  selected,
  onSelectDate,
}: {
  dateKey: string;
  level: ActivityLevel;
  cellSize: number;
  selected: boolean;
  onSelectDate: (dateKey: string) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const levelColors = useMemo(() => getLevelColors(colors), [colors]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelectDate(dateKey)}
      pressRetentionOffset={8}
      style={{ width: cellSize, height: cellSize }}
      accessibilityRole="button"
      accessibilityLabel={`${dateKey}, activity level ${level}`}>
      <View
        pointerEvents="none"
        style={[
          styles.cell,
          { backgroundColor: levelColors[level] },
          selected && styles.cellSelected,
        ]}
      />
    </TouchableOpacity>
  );
});

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    section: {
      gap: Spacing.lg,
    },
    graph: {
      gap: Spacing.sm,
      width: '100%',
    },
    yearView: {
      width: '100%',
      gap: Spacing.xs,
    },
    yearPage: {
      width: '100%',
      gap: Spacing.xs,
    },
    yearPager: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: Spacing.xs,
    },
    yearPagerDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    yearPagerDotActive: {
      backgroundColor: colors.accent,
    },
    monthLabelRow: {
      flexDirection: 'row',
      minHeight: 14,
    },
    monthLabel: {
      ...Typography.metadata,
      fontSize: 10,
      color: colors.textMuted,
    },
    yearGrid: {
      flexDirection: 'row',
      width: '100%',
    },
    yearWeekColumn: {
      flex: 1,
      flexDirection: 'column',
    },
    cellSlot: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cell: {
      flex: 1,
      width: '100%',
      height: '100%',
      borderRadius: CELL_RADIUS,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderSubtle,
    },
    emptyCell: {
      borderRadius: CELL_RADIUS,
    },
    cellSelected: {
      borderColor: colors.accent,
      borderWidth: 1.5,
    },
    selectedDateLabel: {
      ...Typography.metadata,
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
