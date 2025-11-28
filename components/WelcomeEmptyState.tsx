import { MaterialIcons } from '@expo/vector-icons';
import Icon from '../components/Icon';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WelcomeEmptyStateProps {
  onPress: () => void;
}

export default function WelcomeEmptyState({ onPress }: WelcomeEmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.emptyState,
        {
          backgroundColor: pressed ? theme.surface : 'transparent',
          transform: [{ scale: pressed ? 0.98 : 1 }],
          borderColor: theme.divider,
        }
      ]}
      onPress={onPress}
      accessibilityLabel="Create your first project"
      accessibilityHint="Tap to create your first document scanning project"
    >
      <Icon name="document-scanner" size={80} color={theme.primary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Welcome to PastForward</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Tap here to create your first project
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 120,
    marginHorizontal: 20,
    marginVertical: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 250,
  },
}); 