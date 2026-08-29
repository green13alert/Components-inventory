import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileStatCard } from '@/components/profile/ProfileStatCard';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { useAtlas } from '@/context/atlas-context';
import { SolderiColors } from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { getProjectsWithStatus, inventory } = useAtlas();

  const projects = getProjectsWithStatus();
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress');

  const recentActivity = [
    ...inProgressProjects.slice(0, 1).map((p) => ({
      title: p.title,
      detail: `${p.progress ?? 0}% complete`,
      icon: 'leaf-outline' as const,
    })),
    ...projects
      .filter((p) => p.status === 'completed')
      .slice(0, 2)
      .map((p) => ({
        title: p.title,
        detail: `Completed · ${p.duration}`,
        icon: 'checkmark-circle-outline' as const,
      })),
  ].slice(0, 3);

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
            <Ionicons name="chevron-back" size={24} color={SolderiColors.textPrimary} />
          </Pressable>
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={SolderiColors.textSecondary} />
          </View>
          <Text style={styles.name}>Maker</Text>
          <Text style={styles.email}>maker@atlas.app</Text>
          <View style={styles.memberBadge}>
            <Ionicons name="sparkles" size={14} color={SolderiColors.accent} />
            <Text style={styles.memberText}>Atlas Maker · Level 3</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <ProfileStatCard icon="cube-outline" value={String(inventory.length)} label="Components" />
          <ProfileStatCard icon="folder-open-outline" value={String(inProgressCount)} label="Projects" />
          <ProfileStatCard icon="checkmark-circle-outline" value={String(completedCount)} label="Completed" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <View key={item.title} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={item.icon} size={20} color={SolderiColors.textSecondary} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityDetail}>{item.detail}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyActivity}>No activity yet — start a project!</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsList}>
            <SettingsRow icon="person-outline" label="Account" />
            <SettingsRow icon="notifications-outline" label="Notifications" value="On" />
            <SettingsRow
              icon="cube-outline"
              label="Manage Inventory"
              onPress={() => router.push('/(tabs)/inventory')}
            />
            <SettingsRow
              icon="bookmark-outline"
              label="Favourite Projects"
              onPress={() =>
                router.push({ pathname: '/(tabs)/projects', params: { filter: 'favourites' } })
              }
            />
            <SettingsRow icon="help-circle-outline" label="Help & Support" />
            <SettingsRow icon="information-circle-outline" label="About Atlas" value="v1.0" />
            <SettingsRow icon="log-out-outline" label="Sign Out" destructive />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SolderiColors.background,
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
    color: SolderiColors.textPrimary,
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
    backgroundColor: SolderiColors.surfaceElevated,
    borderWidth: 2,
    borderColor: SolderiColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: SolderiColors.textPrimary,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 15,
    color: SolderiColors.textSecondary,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: SolderiColors.accentSoft,
  },
  memberText: {
    fontSize: 13,
    fontWeight: '600',
    color: SolderiColors.accent,
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
    color: SolderiColors.textPrimary,
    letterSpacing: -0.3,
  },
  activityList: {
    gap: 10,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: SolderiColors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SolderiColors.border,
    padding: 14,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SolderiColors.surfaceElevated,
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
    color: SolderiColors.textPrimary,
  },
  activityDetail: {
    fontSize: 13,
    color: SolderiColors.textSecondary,
  },
  emptyActivity: {
    fontSize: 14,
    color: SolderiColors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },
  settingsList: {
    gap: 8,
  },
});
