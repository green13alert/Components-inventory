import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProjectComponentRow } from '@/components/projects/ProjectComponentRow';
import { ProjectDetailStat } from '@/components/projects/ProjectDetailStat';
import { useAtlas } from '@/context/atlas-context';
import { ArduinoColors } from '@/constants/colors';
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  getProjectById,
  getProjectComponents,
  getProjectOverview,
  getStartButtonLabel,
  getStepCount,
} from '@/constants/projects-data';

const DIFFICULTY_COLORS = {
  beginner: ArduinoColors.success,
  intermediate: ArduinoColors.warning,
  advanced: '#F87171',
} as const;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getProjectStatus, getProjectProgressPercent, startProject } = useAtlas();
  const project = getProjectById(id ?? '');

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={ArduinoColors.textMuted} />
          <Text style={styles.notFoundTitle}>Project not found</Text>
          <Pressable style={styles.notFoundButton} onPress={() => router.back()}>
            <Text style={styles.notFoundButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const components = getProjectComponents(project);
  const matchPercent = Math.round((project.ownedParts / project.totalParts) * 100);
  const missingCount = project.totalParts - project.ownedParts;
  const overview = getProjectOverview(project);
  const stepCount = getStepCount(project.difficulty);
  const status = getProjectStatus(project.id);
  const progress = getProjectProgressPercent(project.id, project.difficulty);

  const handleStart = () => {
    if (status === 'not_started') {
      startProject(project.id);
    }
    router.push({ pathname: '/project/build/[id]', params: { id: project.id } });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.hero}>
          <Image source={project.image} style={styles.heroImage} contentFit="cover" transition={200} />
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.titleSection}>
            <View style={styles.badges}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{CATEGORY_LABELS[project.category]}</Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: `${DIFFICULTY_COLORS[project.difficulty]}22` },
                ]}>
                <Text style={[styles.difficultyText, { color: DIFFICULTY_COLORS[project.difficulty] }]}>
                  {DIFFICULTY_LABELS[project.difficulty]}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>

          <View style={styles.statsRow}>
            <ProjectDetailStat icon="time-outline" label="Time" value={project.duration} />
            <ProjectDetailStat icon="list-outline" label="Steps" value={`${stepCount}`} />
            <ProjectDetailStat icon="cube-outline" label="Parts" value={`${matchPercent}%`} />
          </View>

          {(status === 'in_progress' || status === 'completed') && progress > 0 ? (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressValue}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>{overview}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsCard}>
              <DetailRow icon="layers-outline" label="Category" value={CATEGORY_LABELS[project.category]} />
              <DetailRow icon="bar-chart-outline" label="Difficulty" value={DIFFICULTY_LABELS[project.difficulty]} />
              <DetailRow icon="time-outline" label="Estimated Time" value={project.duration} />
              <DetailRow icon="footsteps-outline" label="Total Steps" value={`${stepCount} steps`} />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.componentsHeader}>
              <Text style={styles.sectionTitle}>Components</Text>
              <Text style={styles.componentsCount}>
                {project.ownedParts}/{project.totalParts} owned
              </Text>
            </View>
            {missingCount > 0 ? (
              <View style={styles.missingBanner}>
                <Ionicons name="warning-outline" size={16} color={ArduinoColors.warning} />
                <Text style={styles.missingBannerText}>
                  {missingCount} part{missingCount !== 1 ? 's' : ''} missing from your inventory
                </Text>
              </View>
            ) : (
              <View style={styles.readyBanner}>
                <Ionicons name="checkmark-circle-outline" size={16} color={ArduinoColors.success} />
                <Text style={styles.readyBannerText}>You have all the parts needed!</Text>
              </View>
            )}
            <View style={styles.componentsList}>
              {components.map((component) => (
                <ProjectComponentRow key={component.id} component={component} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.startButton} onPress={handleStart} accessibilityRole="button">
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>{getStartButtonLabel(status)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={ArduinoColors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: ArduinoColors.surfaceElevated,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 17, 23, 0.35)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 17, 23, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 24,
  },
  titleSection: {
    gap: 10,
    marginTop: -40,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: ArduinoColors.blueMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: ArduinoColors.blue,
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: ArduinoColors.textPrimary,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: ArduinoColors.textSecondary,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressCard: {
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 16,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ArduinoColors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
    color: ArduinoColors.blue,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ArduinoColors.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: ArduinoColors.blue,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
    letterSpacing: -0.3,
  },
  overviewText: {
    fontSize: 15,
    lineHeight: 24,
    color: ArduinoColors.textSecondary,
  },
  detailsCard: {
    backgroundColor: ArduinoColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
    padding: 4,
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: ArduinoColors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
  },
  componentsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  componentsCount: {
    fontSize: 14,
    color: ArduinoColors.textSecondary,
  },
  missingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  missingBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: ArduinoColors.warning,
  },
  readyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  readyBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: ArduinoColors.success,
  },
  componentsList: {
    gap: 8,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: ArduinoColors.background,
    borderTopWidth: 1,
    borderTopColor: ArduinoColors.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ArduinoColors.blue,
    borderRadius: 16,
    paddingVertical: 18,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: ArduinoColors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ArduinoColors.textPrimary,
  },
  notFoundButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ArduinoColors.surface,
    borderWidth: 1,
    borderColor: ArduinoColors.border,
  },
  notFoundButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ArduinoColors.textPrimary,
  },
});
