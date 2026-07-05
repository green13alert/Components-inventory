import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';
import { NavBox } from '@/components/home/NavBox';
import { InfoBox } from '@/components/home/InfoBox';
import { ProjectCard } from '@/components/home/ProjectCard';
import { RecommendedProjectCard } from '@/components/home/RecommendedProjectCard';
import { SearchBar } from '@/components/home/SearchBar';
import { ArduinoColors } from '@/constants/colors';

const POPULAR_PROJECTS = [
  { title: 'LED Matrix Display', difficulty: 'Beginner', duration: '2 hrs', icon: 'grid-outline' as const },
  { title: 'Bluetooth RC Car', difficulty: 'Intermediate', duration: '5 hrs', icon: 'car-sport-outline' as const },
  { title: 'Weather Station', difficulty: 'Intermediate', duration: '4 hrs', icon: 'cloud-outline' as const },
  { title: 'Home Automation Hub', difficulty: 'Advanced', duration: '8 hrs', icon: 'home-outline' as const },
  { title: 'Line Following Robot', difficulty: 'Beginner', duration: '3 hrs', icon: 'hardware-chip-outline' as const },
];

const RECOMMENDED_PROJECTS = [
  { title: 'Arduino Door Lock System', ownedParts: 8, totalParts: 10, icon: 'lock-closed-outline' as const },
  { title: 'Motion Sensor Alarm', ownedParts: 5, totalParts: 6, icon: 'alert-circle-outline' as const },
  { title: 'Smart Thermostat', ownedParts: 11, totalParts: 14, icon: 'thermometer-outline' as const },
  { title: 'Pulse Oximeter', ownedParts: 7, totalParts: 9, icon: 'heart-outline' as const },
  { title: 'Automated Greenhouse', ownedParts: 9, totalParts: 12, icon: 'leaf-outline' as const },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>Maker</Text>
        </View>

        <SearchBar />

        <View style={styles.navGrid}>
          <View style={styles.navRow}>
            <InfoBox label="5 Days Streak" icon="flame" />
            <InfoBox label=" 10 Components" icon="bulb" />
            <InfoBox label="5 Projects Completed" icon="trophy-sharp" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.navGrid}>
          <View style={styles.navRow}>
            <NavBox label="Inventory" icon="cube-outline" />
            <NavBox label="Projects" icon="folder-open-outline" />
            <NavBox label="Saved" icon="bookmark-outline" />
            <NavBox label="AI Assistant" icon="sparkles-outline" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <ContinueLearningCard
            title="Smart Plant Monitor"
            subtitle="Step 4 of 8 · Soil moisture sensor wiring"
            progress={52}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Recommendations</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {POPULAR_PROJECTS.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Text style={styles.sectionSubtitle}>Based on your current inventory</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {RECOMMENDED_PROJECTS.map((project) => (
              <RecommendedProjectCard key={project.title} {...project} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    paddingTop: 8,
    gap: 2,
  },
  greeting: {
    fontSize: 16,
    color: ArduinoColors.textSecondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    letterSpacing: -0.5,
  },
  navGrid: {
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: ArduinoColors.textSecondary,
    marginTop: -8,
  },
  horizontalList: {
    gap: 12,
    paddingRight: 4,
  },
});
