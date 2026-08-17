import { Ionicons } from '@expo/vector-icons';

import { useLocalSearchParams } from 'expo-router';

import { useEffect, useMemo, useState } from 'react';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';



import { ContinueLearningCard } from '@/components/home/ContinueLearningCard';

import { SearchBar } from '@/components/home/SearchBar';

import { FilterChips } from '@/components/inventory/FilterChips';

import { ProjectListCard } from '@/components/projects/ProjectListCard';

import { PageHeader } from '@/components/ui/page-header';

import { useAtlas } from '@/context/atlas-context';

import { ArduinoColors } from '@/constants/colors';

import { tabBarBottomPadding } from '@/constants/layout';

import { getProjectSteps, getStepSubtitle } from '@/constants/project-steps';

import {

  PROJECT_DIFFICULTY_FILTERS,

  PROJECT_VIEW_FILTERS,

  ProjectDifficultyFilter,

  ProjectViewFilter,

} from '@/constants/projects-data';



export default function ProjectsScreen() {

  const insets = useSafeAreaInsets();

  const { filter } = useLocalSearchParams<{ filter?: string }>();

  const { getProjectsWithStatus, isFavourite } = useAtlas();

  const [searchQuery, setSearchQuery] = useState('');

  const [viewFilter, setViewFilter] = useState<ProjectViewFilter>('all');

  const [difficultyFilter, setDifficultyFilter] = useState<ProjectDifficultyFilter>('all');



  useEffect(() => {

    if (filter === 'favourites') {

      setViewFilter('favourites');

    }

  }, [filter]);



  const allProjects = getProjectsWithStatus();



  const inProgressProject = useMemo(

    () => allProjects.find((p) => p.status === 'in_progress'),

    [allProjects],

  );



  const filteredProjects = useMemo(() => {

    const query = searchQuery.trim().toLowerCase();



    return allProjects.filter((project) => {

      const matchesView =

        viewFilter === 'all' ||

        (viewFilter === 'in_progress' && project.status === 'in_progress') ||

        (viewFilter === 'favourites' && isFavourite(project.id)) ||

        (viewFilter === 'completed' && project.status === 'completed');



      const matchesDifficulty =

        difficultyFilter === 'all' || project.difficulty === difficultyFilter;



      const matchesSearch =

        query.length === 0 ||

        project.title.toLowerCase().includes(query) ||

        project.description.toLowerCase().includes(query);



      return matchesView && matchesDifficulty && matchesSearch;

    });

  }, [allProjects, searchQuery, viewFilter, difficultyFilter, isFavourite]);



  const showContinueSection =

    viewFilter === 'all' && inProgressProject != null && searchQuery.trim().length === 0;



  const continueSubtitle = inProgressProject

    ? getStepSubtitle(

        inProgressProject,

        Math.max(

          0,

          Math.round(

            ((inProgressProject.progress ?? 0) / 100) * getProjectSteps(inProgressProject).length,

          ) - 1,

        ),

        getProjectSteps(inProgressProject),

      )

    : '';



  return (

    <SafeAreaView style={styles.safeArea} edges={['top']}>

      <ScrollView

        style={styles.scroll}

        contentContainerStyle={[

          styles.content,

          { paddingBottom: tabBarBottomPadding(insets.bottom) },

        ]}

        showsVerticalScrollIndicator={false}

        keyboardShouldPersistTaps="handled">

        <PageHeader title="Projects" subtitle="Browse and manage your Arduino builds" />



        <SearchBar

          placeholder="Search projects..."

          value={searchQuery}

          onChangeText={setSearchQuery}

        />



        <FilterChips

          filters={PROJECT_VIEW_FILTERS}

          selected={viewFilter}

          onSelect={setViewFilter}

        />



        <FilterChips

          filters={PROJECT_DIFFICULTY_FILTERS}

          selected={difficultyFilter}

          onSelect={setDifficultyFilter}

        />



        {showContinueSection && inProgressProject ? (

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>Continue Building</Text>

            <ContinueLearningCard

              projectId={inProgressProject.id}

              title={inProgressProject.title}

              subtitle={continueSubtitle}

              progress={inProgressProject.progress ?? 0}

              image={inProgressProject.image}

            />

          </View>

        ) : null}



        <View style={styles.listHeader}>

          <Text style={styles.listTitle}>

            {viewFilter === 'all' ? 'All Projects' : PROJECT_VIEW_FILTERS.find((f) => f.id === viewFilter)?.label}

          </Text>

          <Text style={styles.listCount}>{filteredProjects.length} projects</Text>

        </View>



        <View style={styles.list}>

          {filteredProjects.length > 0 ? (

            filteredProjects.map((project) => (

              <ProjectListCard key={project.id} project={project} />

            ))

          ) : (

            <View style={styles.emptyState}>

              <Ionicons name="folder-open-outline" size={32} color={ArduinoColors.textMuted} />

              <Text style={styles.emptyTitle}>No projects found</Text>

              <Text style={styles.emptySubtitle}>Try a different search or filter</Text>

            </View>

          )}

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

    gap: 20,

  },

  section: {

    gap: 14,

  },

  sectionTitle: {

    fontSize: 18,

    fontWeight: '700',

    color: ArduinoColors.textPrimary,

    letterSpacing: -0.3,

  },

  listHeader: {

    flexDirection: 'row',

    alignItems: 'baseline',

    justifyContent: 'space-between',

  },

  listTitle: {

    fontSize: 18,

    fontWeight: '700',

    color: ArduinoColors.textPrimary,

  },

  listCount: {

    fontSize: 14,

    color: ArduinoColors.textSecondary,

  },

  list: {

    gap: 10,

  },

  emptyState: {

    alignItems: 'center',

    paddingVertical: 40,

    gap: 8,

  },

  emptyTitle: {

    fontSize: 16,

    fontWeight: '700',

    color: ArduinoColors.textPrimary,

  },

  emptySubtitle: {

    fontSize: 14,

    color: ArduinoColors.textSecondary,

  },

});


