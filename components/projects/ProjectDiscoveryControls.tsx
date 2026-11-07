import { Ionicons } from '@expo/vector-icons';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BackHandler,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
  type View as ViewType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SolderiPalette } from '@/constants/colors';
import { Radii, Spacing } from '@/constants/tokens';
import { useSolderiColors } from '@/context/theme-context';
import {
  PROJECT_DIFFICULTY_OPTIONS,
  PROJECT_SORT_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  activateProjectMenu,
  projectMenuFromOverlayTap,
  projectMenuRowLayout,
  type DiscoveryDifficulty,
  type DiscoverySort,
  type ProjectCatalogueFilters,
  type ProjectMenuAnchor,
  type ProjectMenuId,
  type ProjectStatusFilter,
} from '@/lib/project-discovery';

type ProjectCatalogueDropdownsProps = {
  filters: ProjectCatalogueFilters;
  openMenu: ProjectMenuId | null;
  onMenuChange: (menu: ProjectMenuId | null) => void;
  onAnchor: (anchor: ProjectMenuAnchor) => void;
};

export function ProjectCatalogueDropdowns({
  filters,
  openMenu,
  onMenuChange,
  onAnchor,
}: ProjectCatalogueDropdownsProps) {
  const { width: screenWidth } = useWindowDimensions();
  const row = projectMenuRowLayout(filters, screenWidth - 40);
  return (
    <View style={layout.row}>
      {row.buttons.map((button) => (
        <MenuButton
          key={button.menu}
          button={button}
          openMenu={openMenu}
          onMenuChange={onMenuChange}
          onAnchor={onAnchor}
        />
      ))}
    </View>
  );
}

function MenuButton({
  button,
  openMenu,
  onMenuChange,
  onAnchor,
}: {
  button: ReturnType<typeof projectMenuRowLayout>['buttons'][number];
  openMenu: ProjectMenuId | null;
  onMenuChange: (menu: ProjectMenuId | null) => void;
  onAnchor: (anchor: ProjectMenuAnchor) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const anchorRef = useRef<ViewType>(null);

  const publishAnchor = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      onAnchor({ menu: button.menu, x, y, width, height });
    });
  };

  useLayoutEffect(() => {
    publishAnchor();
  }, [button.label, button.width]);

  return (
    <View ref={anchorRef} collapsable={false} style={[layout.slot, { width: button.width }]} onLayout={publishAnchor}>
      <Pressable
        style={styles.control}
        onPress={() => {
          Keyboard.dismiss();
          publishAnchor();
          onMenuChange(activateProjectMenu(openMenu, button.menu));
        }}
        accessibilityRole="button"
        accessibilityLabel={button.accessibilityLabel}
        accessibilityState={{ expanded: openMenu === button.menu, selected: button.selected }}>
        <Text style={styles.controlText} numberOfLines={1}>
          {button.label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

export function ProjectMenuOverlay({
  filters,
  openMenu,
  anchors,
  onMenuChange,
  onStatus,
  onDifficulty,
  onSort,
}: {
  filters: ProjectCatalogueFilters;
  openMenu: ProjectMenuId | null;
  anchors: readonly ProjectMenuAnchor[];
  onMenuChange: (menu: ProjectMenuId | null) => void;
  onStatus: (status: ProjectStatusFilter) => void;
  onDifficulty: (difficulty: DiscoveryDifficulty) => void;
  onSort: (sort: DiscoverySort) => void;
}) {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const frameRef = useRef<ViewType>(null);
  const origin = useRef({ x: 0, y: insets.top });

  useEffect(() => {
    if (!openMenu) {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onMenuChange(null);
      return true;
    });
    return () => subscription.remove();
  }, [onMenuChange, openMenu]);

  if (!openMenu) {
    return null;
  }

  const anchor = anchors.find((item) => item.menu === openMenu);
  const options =
    openMenu === 'status'
      ? PROJECT_STATUS_OPTIONS
      : openMenu === 'difficulty'
        ? PROJECT_DIFFICULTY_OPTIONS
        : PROJECT_SORT_OPTIONS;
  const selected =
    openMenu === 'status' ? filters.status : openMenu === 'difficulty' ? filters.difficulty : filters.sort;
  const menuWidth = Math.min(260, screenWidth - Spacing.lg);
  const menuHeight = options.length * 48;
  let left = (anchor?.x ?? Spacing.lg) - origin.current.x;
  if (left + menuWidth > screenWidth - Spacing.sm) {
    left = screenWidth - Spacing.sm - menuWidth;
  }
  if (left < Spacing.sm) {
    left = Spacing.sm;
  }
  let top = (anchor?.y ?? insets.top) - origin.current.y + (anchor?.height ?? 44) + Spacing.xs;
  const bottomLimit = screenHeight - origin.current.y - Math.max(insets.bottom, Spacing.sm);
  if (top + menuHeight > bottomLimit) {
    top = Math.max(Spacing.sm, (anchor?.y ?? insets.top) - origin.current.y - menuHeight - Spacing.xs);
  }

  const choose = (id: string) => {
    if (openMenu === 'status') {
      onStatus(id as ProjectStatusFilter);
    } else if (openMenu === 'difficulty') {
      onDifficulty(id as DiscoveryDifficulty);
    } else {
      onSort(id as DiscoverySort);
    }
    onMenuChange(null);
  };

  const onBackdrop = (event: GestureResponderEvent) => {
    onMenuChange(
      projectMenuFromOverlayTap(openMenu, anchors, event.nativeEvent.pageX, event.nativeEvent.pageY),
    );
  };

  return (
    <View
      ref={frameRef}
      style={styles.overlay}
      onLayout={() => {
        frameRef.current?.measureInWindow((x, y) => {
          origin.current = { x, y };
        });
      }}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdrop} accessibilityLabel="Close menu" />
      <View style={[styles.menu, { top, left, width: menuWidth }]}>
        {options.map((option, index) => {
          const isSelected = option.id === selected;
          return (
            <View key={option.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => choose(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={option.label}>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
                {isSelected ? (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                ) : (
                  <View style={styles.checkSpacer} />
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const layout = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  slot: {
    flexGrow: 0,
    flexShrink: 0,
  },
});

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    control: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.sm,
      borderRadius: Radii.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    controlText: {
      flexShrink: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    menu: {
      position: 'absolute',
      backgroundColor: colors.surface,
      borderRadius: Radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    option: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    optionPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    optionLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    optionLabelSelected: {
      color: colors.accent,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: Spacing.lg,
    },
    checkSpacer: {
      width: 20,
      height: 20,
    },
  });
}
