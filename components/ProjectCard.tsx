import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmationDialog from './ConfirmationDialog';

interface Project {
  id: string;
  name: string;
  description: string;
  pageCount: number;
  lockOrientation?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export default function ProjectCard({ project, onDeleteProject }: ProjectCardProps) {
  const { theme } = useTheme();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const translateX = useSharedValue(0);
  const isSwipeOpen = useSharedValue(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/project/${project.id}?name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}&lockOrientation=${project.lockOrientation || false}`);
  };

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateX.value = withSpring(0);
    isSwipeOpen.value = false;
    router.push(`/edit-project?id=${project.id}&name=${encodeURIComponent(project.name)}&description=${encodeURIComponent(project.description || '')}`);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    translateX.value = withSpring(0);
    isSwipeOpen.value = false;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await onDeleteProject(project.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project. Please try again.');
    }
    setShowDeleteDialog(false);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -160);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -80) {
        translateX.value = withSpring(-160);
        isSwipeOpen.value = true;
      } else {
        translateX.value = withSpring(0);
        isSwipeOpen.value = false;
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedActionsStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + 160 }],
    };
  });

  return (
    <>
      <View style={styles.cardContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.projectCard, { backgroundColor: theme.card }, animatedCardStyle]}>
            <Pressable onPress={handlePress} style={[styles.cardContent, { borderBottomColor: theme.divider }]}>
              <View style={styles.projectInfo}>
                <Text style={[styles.projectName, { color: theme.text }]}>{project.name}</Text>
                {project.description ? (
                  <Text style={[styles.projectDescription, { color: theme.textSecondary }]}>{project.description}</Text>
                ) : null}
                <Text style={[styles.pageCount, { color: theme.primary }]}>
                  {project.pageCount} {project.pageCount === 1 ? 'page' : 'pages'}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.textTertiary} />
            </Pressable>
          </Animated.View>
        </GestureDetector>

        {/* Swipe Actions - Native iOS Style */}
        <Animated.View style={[styles.swipeActions, animatedActionsStyle]}>
          <View style={[styles.actionButton, { backgroundColor: theme.primary }]}>
            <Pressable
              style={styles.actionPressable}
              onPress={handleEdit}
            >
              <Icon name="edit" size={20} color="white" />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
          </View>
          
          <View style={[styles.actionButton, { backgroundColor: theme.error }]}>
            <Pressable
              style={styles.actionPressable}
              onPress={handleDelete}
            >
              <Icon name="delete" size={20} color="white" />
              <Text style={styles.actionText}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all ${project.pageCount} page${project.pageCount !== 1 ? 's' : ''} in this project. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmStyle="destructive"
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'relative',
    marginBottom: 1, // Minimal spacing like iOS
    overflow: 'hidden',
  },
  projectCard: {
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 2,
  },
  projectDescription: {
    fontSize: 15,
    marginBottom: 4,
  },
  pageCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    height: '100%',
  },
  actionPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});