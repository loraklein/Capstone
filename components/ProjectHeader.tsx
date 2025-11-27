import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectHeaderProps {
  projectName: string;
  description?: string;
  pageCount: number;
  showAddButton?: boolean;
  onAddPage?: () => void;
  onBack?: () => void;
  onManageChapters?: () => void;
}

export default function ProjectHeader({
  projectName,
  description,
  pageCount,
  showAddButton,
  onAddPage,
  onBack,
  onManageChapters
}: ProjectHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.header, 
      { 
        backgroundColor: theme.surface, 
        borderBottomColor: theme.divider,
        paddingTop: Platform.OS === 'web' ? 20 : insets.top + 20, // Add safe area top padding on mobile
      }
    ]}>
      <View style={styles.headerTop}>
        {onBack && (
          <Pressable 
            style={[styles.backButton, { backgroundColor: theme.secondary }]}
            onPress={onBack}
          >
            <Icon name="arrow-back" size={24} color={theme.text} />
          </Pressable>
        )}
        <View style={styles.headerContent}>
          <Text style={[styles.projectName, { color: theme.text }]}>
            {projectName}
          </Text>
          {description ? (
            <Text style={[styles.projectDescription, { color: theme.textSecondary }]}>{description}</Text>
          ) : null}
        </View>
      </View>
      
      <View style={styles.actionsRow}>
        <View style={styles.statItem}>
          <Icon name="photo-library" size={20} color={theme.primary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          {onManageChapters && (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.secondary,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }
              ]}
              onPress={onManageChapters}
            >
              <Icon name="bookmark" size={24} color={theme.text} />
            </Pressable>
          )}

          {showAddButton && onAddPage && (
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                {
                  backgroundColor: theme.primary,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                }
              ]}
              onPress={onAddPage}
            >
              <Icon name="add" size={20} color="white" />
              <Text style={[styles.addButtonText, { color: 'white' }]}>Add Page</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    marginBottom: 0,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    minWidth: 56,
    minHeight: 56,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 