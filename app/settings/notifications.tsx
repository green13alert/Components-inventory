import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsSection } from '@/components/profile/SettingsSection';
import { SettingsSwitchRow } from '@/components/profile/SettingsSwitchRow';
import type { SolderiPalette } from '@/constants/colors';
import { useSolderiColors } from '@/context/theme-context';

export default function NotificationsSettingsScreen() {
  const colors = useSolderiColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const [projectReminders, setProjectReminders] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(false);
  const [buildActivity, setBuildActivity] = useState(false);
  const [projectCompletion, setProjectCompletion] = useState(false);
  const [projectRecommendations, setProjectRecommendations] = useState(false);
  const [newProjects, setNewProjects] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <SettingsSection title="Projects" dividerInset={16}>
          <SettingsSwitchRow
            grouped
            label="Project reminders"
            value={projectReminders}
            onValueChange={setProjectReminders}
          />
          <SettingsSwitchRow
            grouped
            label="Project updates"
            value={projectUpdates}
            onValueChange={setProjectUpdates}
          />
        </SettingsSection>

        <SettingsSection title="Activity" dividerInset={16}>
          <SettingsSwitchRow
            grouped
            label="Build activity"
            value={buildActivity}
            onValueChange={setBuildActivity}
          />
          <SettingsSwitchRow
            grouped
            label="Project completion"
            value={projectCompletion}
            onValueChange={setProjectCompletion}
          />
        </SettingsSection>

        <SettingsSection title="Recommendations" dividerInset={16}>
          <SettingsSwitchRow
            grouped
            label="Project recommendations"
            value={projectRecommendations}
            onValueChange={setProjectRecommendations}
          />
          <SettingsSwitchRow
            grouped
            label="New projects"
            value={newProjects}
            onValueChange={setNewProjects}
          />
        </SettingsSection>
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
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
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
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
      gap: 22,
    },
  });
}
