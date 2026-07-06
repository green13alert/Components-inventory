import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';
import { NavBox } from '@/components/home/NavBox';
import { InfoBox } from '@/components/home/InfoBox';
import { ProjectCard } from '@/components/home/ProjectCard';
import { RecommendedProjectCard } from '@/components/home/RecommendedProjectCard';
import { SearchBar } from '@/components/home/SearchBar';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { ArduinoColors } from '@/constants/colors';
import { tabBarBottomPadding } from '@/constants/layout';
import { PROJECT_IMAGES } from '@/constants/projects';

const POPULAR_PROJECTS = [
  {
    title: 'LED Matrix Display',
    difficulty: 'Beginner',
    duration: '2 hrs',
    image: PROJECT_IMAGES.ledMatrix,
  },
  {
    title: 'Bluetooth RC Car',
    difficulty: 'Intermediate',
    duration: '5 hrs',
    image: PROJECT_IMAGES.bluetoothRcCar,
  },
  {
    title: 'Weather Station',
    difficulty: 'Intermediate',
    duration: '4 hrs',
    image: PROJECT_IMAGES.weatherStation,
  },
  {
    title: 'Home Automation Hub',
    difficulty: 'Advanced',
    duration: '8 hrs',
    image: PROJECT_IMAGES.homeAutomation,
  },
  {
    title: 'Line Following Robot',
    difficulty: 'Beginner',
    duration: '3 hrs',
    image: PROJECT_IMAGES.lineFollowingRobot,
  },
];

const RECOMMENDED_PROJECTS = [
  {
    title: 'Arduino Door Lock System',
    ownedParts: 8,
    totalParts: 10,
    image: PROJECT_IMAGES.doorLock,
  },
  {
    title: 'Motion Sensor Alarm',
    ownedParts: 5,
    totalParts: 6,
    image: PROJECT_IMAGES.motionSensor,
  },
  {
    title: 'Smart Thermostat',
    ownedParts: 11,
    totalParts: 14,
    image: PROJECT_IMAGES.smartThermostat,
  },
  {
    title: 'Pulse Oximeter',
    ownedParts: 7,
    totalParts: 9,
    image: PROJECT_IMAGES.pulseOximeter,
  },
  {
    title: 'Automated Greenhouse',
    ownedParts: 9,
    totalParts: 12,
    image: PROJECT_IMAGES.automatedGreenhouse,
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarBottomPadding(insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Maker</Text>
          </View>
          <ProfileAvatar />
        </View>

        <SearchBar placeholder="Search projects..." editable={false} />

        <View style={styles.navGrid}>
          <View style={styles.navRow}>
            <InfoBox label="7 Days Streak" icon="flame" />
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
            <NavBox label="Ask Ai" icon="sparkles-outline" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <ContinueLearningCard
            title="Smart Plant Monitor"
            subtitle="Step 4 of 8 · Soil moisture sensor wiring"
            progress={52}
            image={PROJECT_IMAGES.smartPlantMonitor}
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
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 8,
    gap: 12,
  },
  headerText: {
    flex: 1,
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
