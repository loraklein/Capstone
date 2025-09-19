import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import AddProjectButton from '../../components/AddProjectButton';
import ProjectCard from '../../components/ProjectCard';
import WelcomeEmptyState from '../../components/WelcomeEmptyState';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjects } from '../../hooks/useProjects';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { projects, loadProjects, refreshProjects, deleteProject } = useProjects();

  React.useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useFocusEffect(
    React.useCallback(() => {
      refreshProjects();
    }, [refreshProjects])
  );

  const handleAddProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-project');
  };

  const renderProject = ({ item }: { item: any }) => (
    <ProjectCard project={item} onDeleteProject={deleteProject} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {projects.length === 0 ? (
          <WelcomeEmptyState onPress={handleAddProject} />
        ) : (
          <FlatList
            data={projects}
            renderItem={renderProject}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.projectsList}
          />
        )}
      </View>

      {projects.length > 0 && (
        <AddProjectButton onPress={handleAddProject} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  projectsList: {
    paddingTop: 8,
    paddingBottom: 100,
  },
});