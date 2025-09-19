import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProjectHeaderProps {
  projectName: string;
  description?: string;
  pageCount: number;
  showAddButton?: boolean;
  onAddPage?: () => void;
}

export default function ProjectHeader({ 
  projectName, 
  description, 
  pageCount,
  showAddButton,
  onAddPage
}: ProjectHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerContent}>
          <Text style={[styles.projectName, { color: theme.text }]}>
            {projectName}
          </Text>
          {description ? (
            <Text style={[styles.projectDescription, { color: theme.textSecondary }]}>{description}</Text>
          ) : null}
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialIcons name="photo-library" size={20} color={theme.primary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </View>
      </View>
      
      {showAddButton && onAddPage && (
        <View style={styles.addButtonContainer}>
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
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={[styles.addButtonText, { color: 'white' }]}>Add Page</Text>
          </Pressable>
        </View>
      )}
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
    marginBottom: 16,
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
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
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
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
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