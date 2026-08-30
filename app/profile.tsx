import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileStatCard } from '@/components/profile/ProfileStatCard';
import { SettingsPanel } from '@/components/profile/SettingsPanel';
import type { SolderiPalette } from '@/constants/colors';
import { useAtlas, type WorkshopActivity, type WorkshopActivityKind } from '@/context/atlas-context';
import { useSolderiColors } from '@/context/theme-context';

const ACTIVITY_PREVIEW = 2;
const ACTIVITY_EXPANDED = 5;

const ACTIVITY_ICONS: Record<WorkshopActivityKind, keyof typeof Ionicons.glyphMap> = {
  started: 'play-circle-outline',
  continued: 'construct-outline',
  completed: 'checkmark-circle-outline',
  component_added: 'cube-outline',
};

function activityDetail(
  item: WorkshopActivity,
  progress?: number,
): string {
  switch (item.kind) {
    case 'started':
      return 'Started this project';
    case 'continued':
      return progress != null ? `Continued · ${progress}% complete` : 'Continued this project';
    case 'completed':
      return 'Completed this project';
    case 'component_added':
      return 'Added to inventory';
  }
}

export default function ProfileScreen() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { getProjectsWithStatus, inventory, recentActivity } = useAtlas();
  const [activityExpanded, setActivityExpanded] = useState(false);

  const projects = getProjectsWithStatus();
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const visibleCount = activityExpanded ? ACTIVITY_EXPANDED : ACTIVITY_PREVIEW;
  const canShowMore = recentActivity.length > ACTIVITY_PREVIEW;
  const activityItems = recentActivity.slice(0, visibleCount).map((item) => {
    const project = item.projectId ? projects.find((p) => p.id === item.projectId) : undefined;
    return {
      ...item,
      detail: activityDetail(item, project?.progress),
      icon: ACTIVITY_ICONS[item.kind],
    };
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textSecondary} />
          </View>
          <Text style={styles.name}>Maker</Text>
          <Text style={styles.email}>maker@solderi.app</Text>
        </View>

        <View style={styles.statsRow}>
          <ProfileStatCard icon="cube-outline" value={String(inventory.length)} label="Components" />
          <ProfileStatCard icon="folder-open-outline" value={String(inProgressCount)} label="Projects" />
          <ProfileStatCard icon="checkmark-circle-outline" value={String(completedCount)} label="Completed" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {activityItems.length > 0 ? (
              activityItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.activityRow,
                    pressed && item.projectId ? styles.activityRowPressed : null,
                  ]}
                  onPress={
                    item.projectId ? () => router.push(`/project/${item.projectId}`) : undefined
                  }
                  disabled={!item.projectId}
                  accessibilityRole={item.projectId ? 'button' : 'text'}
                  accessibilityLabel={`${item.title}. ${item.detail}`}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityDetail}>{item.detail}</Text>
                  </View>
                  {item.projectId ? (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  ) : null}
                </Pressable>
              ))
            ) : (
              <Text style={styles.emptyActivity}>No activity yet — start a project or add a component.</Text>
            )}
            {canShowMore ? (
              <Pressable
                style={({ pressed }) => [styles.showMore, pressed && styles.showMorePressed]}
                onPress={() => setActivityExpanded((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={activityExpanded ? 'Show less activity' : 'Show more activity'}>
                <Text style={styles.showMoreText}>{activityExpanded ? 'Show less' : 'Show more'}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <SettingsPanel />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: SolderiPalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 28,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    hero: {
      alignItems: 'center',
      gap: 8,
      paddingTop: 8,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    name: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    email: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    section: {
      gap: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      letterSpacing: -0.3,
    },
    activityList: {
      gap: 10,
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
    },
    activityRowPressed: {
      opacity: 0.72,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityText: {
      flex: 1,
      gap: 2,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    activityDetail: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    emptyActivity: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: 16,
    },
    showMore: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    showMorePressed: {
      opacity: 0.72,
    },
    showMoreText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
  });
}
